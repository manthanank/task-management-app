const Task = require("../models/task.model");
const User = require("../models/user.model");
const Activity = require("../models/activity.model");
const { successResponse, errorResponse } = require("../utils/response");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority, userId } = req.body;
    
    const assignedUser = await User.findById(userId);
    if (!assignedUser) {
      return errorResponse(res, 404, "Assigned user not found");
    }

    const currentUser = req.currentUser;
    if (currentUser.role !== 'super') {
      if (!currentUser.organization || !assignedUser.organization || assignedUser.organization.toString() !== currentUser.organization.toString()) {
         return errorResponse(res, 403, "Cannot assign tasks to users outside your organization");
      }
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

    successResponse(res, 201, "Task created successfully", newTask);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const user = req.currentUser;
    if (!user.organization) {
      return errorResponse(res, 400, "User is not associated with any organization");
    }

    const tasks = await Task.find({
      organization: user.organization
    })
    .populate('user', 'email')
    .sort({ createdAt: -1 })
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
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const priority = req.query.priority || "";
    
    const allowedSortFields = ['deadline', 'createdAt', 'title', 'priority', 'completed'];
    const sortBy = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : "deadline";
    const order = req.query.order === "desc" ? -1 : 1;

    const user = req.currentUser;
    if (!user.organization) {
      return errorResponse(res, 400, "User is not associated with any organization");
    }

    const filter = { 
      completed: false,
      organization: user.organization 
    };

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } }
      ];
    }

    if (priority) {
      filter.priority = priority;
    }

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
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const priority = req.query.priority || "";

    const user = req.currentUser;
    if (!user.organization) {
      return errorResponse(res, 400, "User is not associated with any organization");
    }

    const filter = { 
      completed: true,
      organization: user.organization 
    };

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } }
      ];
    }

    if (priority) {
      filter.priority = priority;
    }

    const tasks = await Task.find(filter)
      .sort({ updatedAt: -1 })
      .populate('user', 'email')
      .skip(skip)
      .limit(limit);
      
    const totalTasks = await Task.countDocuments(filter);

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
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ user: req.user._id })
      .sort({ createdAt: -1 })
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

    const currentUser = req.currentUser;
    if (currentUser.role !== 'super') {
      if (!currentUser.organization || !task.organization || task.organization.toString() !== currentUser.organization.toString()) {
        return errorResponse(res, 403, "Not authorized to view this task");
      }
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
    
    const task = await Task.findById(id);
    if (!task) {
      return errorResponse(res, 404, "Task not found");
    }

    const currentUser = req.currentUser;
    if (currentUser.role !== 'super') {
      if (task.user.toString() !== req.user._id.toString()) {
        if (currentUser.role !== 'admin' || !currentUser.organization || !task.organization || task.organization.toString() !== currentUser.organization.toString()) {
           return errorResponse(res, 403, "Not authorized to update this task");
        }
      }
    }
    
    let action = "updated";
    let details = "Task details updated";

    const allowedFields = ['title', 'description', 'deadline', 'priority', 'completed', 'subtasks'];
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    // Handle task reassignment
    const targetUserId = req.body.userId || req.body.user;
    if (targetUserId && targetUserId.toString() !== task.user.toString()) {
      const assignedUser = await User.findById(targetUserId);
      if (!assignedUser) {
        return errorResponse(res, 404, "Assigned user not found");
      }
      if (currentUser.role !== 'super') {
        if (!currentUser.organization || !assignedUser.organization || assignedUser.organization.toString() !== currentUser.organization.toString()) {
          return errorResponse(res, 403, "Cannot assign tasks to users outside your organization");
        }
      }
      updateData.user = targetUserId;
      action = "reassigned";
      details = `Task reassigned to ${assignedUser.email}`;
    } else if (req.body.completed !== undefined && req.body.completed !== task.completed) {
      action = "status_changed";
      details = req.body.completed ? "Task marked as completed" : "Task marked as ongoing";
    } else if (Array.isArray(req.body.subtasks)) {
      action = "subtask_toggled";
      details = "Checklist updated";
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id, 
      updateData,
      { new: true }
    ).populate('user', 'email');
    
    await new Activity({
      task: updatedTask._id,
      user: req.user._id,
      action: action,
      details: details,
      organization: task.organization
    }).save();

    return successResponse(res, 200, "Task updated successfully", updatedTask);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findById(id);
    if (!task) {
      return errorResponse(res, 404, "Task not found");
    }
    
    const currentUser = req.currentUser;
    if (currentUser.role !== 'super') {
      if (task.user.toString() !== req.user._id.toString()) {
        if (currentUser.role !== 'admin' || !currentUser.organization || !task.organization || task.organization.toString() !== currentUser.organization.toString()) {
           return errorResponse(res, 403, "Not authorized to delete this task");
        }
      }
    }
    
    await new Activity({
      task: id,
      user: req.user._id,
      action: "deleted",
      details: `Task "${task.title}" was deleted`,
      organization: task.organization
    }).save();

    await Task.findByIdAndDelete(id);
    
    successResponse(res, 200, "Task deleted successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get task statistics
exports.getTaskStats = async (req, res) => {
  try {
    const user = req.currentUser;
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
    const task = await Task.findById(req.params.id);
    if (!task) {
      return errorResponse(res, 404, "Task not found");
    }

    const currentUser = req.currentUser;
    if (currentUser.role !== 'super') {
      if (!currentUser.organization || !task.organization || task.organization.toString() !== currentUser.organization.toString()) {
        return errorResponse(res, 403, "Not authorized to view this task's activities");
      }
    }

    const activities = await Activity.find({ task: req.params.id })
      .populate("user", "email")
      .sort({ createdAt: -1 });

    successResponse(res, 200, "Activities retrieved successfully", activities);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
