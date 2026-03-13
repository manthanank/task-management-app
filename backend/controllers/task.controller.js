const Task = require("../models/task.model");
const User = require("../models/user.model");
const Activity = require("../models/activity.model");
const { successResponse, errorResponse } = require("../utils/response");

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority, userId } = req.body;
    
    // Get the organization from the assigned user
    const assignedUser = await User.findById(userId);
    if (!assignedUser) {
      return errorResponse(res, 404, "Assigned user not found");
    }
    
    const newTask = new Task({
      title,
      description,
      deadline,
      priority,
      user: userId,
      organization: assignedUser.organization
    });
    await newTask.save();

    // Log activity
    await new Activity({
      task: newTask._id,
      user: req.user._id,
      action: "created",
      details: `Task created and assigned to ${assignedUser.email}`,
      organization: assignedUser.organization
    }).save();

    successResponse(res, 201, "Task created successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's organization
    const user = await User.findById(req.user._id);
    if (!user.organization) {
      return errorResponse(res, 400, "User is not associated with any organization");
    }

    // Only return tasks for the user's organization
    const tasks = await Task.find({
      organization: user.organization
    })
    .populate('user', 'email')
    .skip(skip)
    .limit(limit);

    const totalTasks = await Task.countDocuments({ organization: user.organization });

    successResponse(res, 200, "Tasks retrieved successfully", {
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get ongoing tasks
exports.getOngoingTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const priority = req.query.priority || "";
    const sortBy = req.query.sortBy || "deadline";
    const order = req.query.order === "desc" ? -1 : 1;

    // Get user's organization
    const user = await User.findById(req.user._id);
    if (!user.organization) {
      return errorResponse(res, 400, "User is not associated with any organization");
    }

    // Build filter object
    const filter = { 
      completed: false,
      organization: user.organization 
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (priority) {
      filter.priority = priority;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = order;

    const tasks = await Task.find(filter)
    .populate('user', 'email')
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
    const totalTasks = await Task.countDocuments(filter);

    successResponse(res, 200, "Ongoing tasks retrieved successfully", {
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get completed tasks
exports.getCompletedTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const priority = req.query.priority || "";

    // Get user's organization
    const user = await User.findById(req.user._id);
    if (!user.organization) {
      return errorResponse(res, 400, "User is not associated with any organization");
    }

    // Build filter object
    const filter = { 
      completed: true,
      organization: user.organization 
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (priority) {
      filter.priority = priority;
    }

    const tasks = await Task.find(filter)
      .sort({ updatedAt: -1 })  // Sort by most recently updated first
      .populate('user', 'email')
      .skip(skip)
      .limit(limit);
      
    const totalTasks = await Task.countDocuments(filter);

    // Ensure we're sending back the proper metadata
    successResponse(res, 200, "Completed tasks retrieved successfully", {
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get all tasks for a user
exports.getAllTasksForUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ user: req.user._id })
      .skip(skip)
      .limit(limit);
    const totalTasks = await Task.countDocuments({ user: req.user._id });

    successResponse(res, 200, "Tasks retrieved successfully", {
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id }).populate(
      "user",
      "-password"
    );
    if (!task) {
      return errorResponse(res, 404, "Task not found");
    }
    successResponse(res, 200, "Task retrieved successfully", task);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the task first to ensure it exists
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    // Determine action and details for logging
    let action = "updated";
    let details = "Task details updated";

    if (req.body.completed !== undefined && req.body.completed !== task.completed) {
      action = "status_changed";
      details = req.body.completed ? "Task marked as completed" : "Task marked as ongoing";
    } else if (req.body.subtasks) {
      action = "subtask_toggled";
      details = "Checklist updated";
    }

    // Update with the data from the request
    const updatedTask = await Task.findByIdAndUpdate(
      id, 
      req.body,
      { new: true } // Return the updated document
    ).populate('user', 'email'); // Populate user info
    
    // Log activity
    await new Activity({
      task: updatedTask._id,
      user: req.user._id,
      action: action,
      details: details,
      organization: task.organization
    }).save();

    return res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the task first to ensure it exists
    const task = await Task.findById(id);
    
    if (!task) {
      return errorResponse(res, 404, "Task not found");
    }
    
    // Check if the user is authorized to delete this task
    // Allow task creator or admin to delete
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 403, "Not authorized to delete this task");
    }
    
    // Log activity
    await new Activity({
      task: id,
      user: req.user._id,
      action: "deleted",
      details: `Task "${task.title}" was deleted`,
      organization: task.organization
    }).save();

    // Delete the task
    await Task.findByIdAndDelete(id);
    
    successResponse(res, 200, "Task deleted successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get task statistics
exports.getTaskStats = async (req, res) => {
  try {
    // Get user's organization
    const user = await User.findById(req.user._id);
    if (!user.organization) {
      return errorResponse(res, 400, "User is not associated with any organization");
    }

    const stats = await Task.aggregate([
      { $match: { organization: user.organization } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ["$completed", 1, 0] } },
          pending: { $sum: { $cond: ["$completed", 0, 1] } },
          highPriority: { $sum: { $cond: [{ $eq: ["$priority", "High"] }, 1, 0] } },
          mediumPriority: { $sum: { $cond: [{ $eq: ["$priority", "Medium"] }, 1, 0] } },
          lowPriority: { $sum: { $cond: [{ $eq: ["$priority", "Low"] }, 1, 0] } }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      completed: 0,
      pending: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0
    };

    successResponse(res, 200, "Stats retrieved successfully", result);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get activity log for a task
exports.getTaskActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ task: req.params.id })
      .populate("user", "email")
      .sort({ createdAt: -1 });

    successResponse(res, 200, "Activities retrieved successfully", activities);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
