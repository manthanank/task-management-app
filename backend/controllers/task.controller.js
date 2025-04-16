const Task = require("../models/task.model");
const User = require("../models/user.model");
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

    // Get user's organization
    const user = await User.findById(req.user._id);
    if (!user.organization) {
      return errorResponse(res, 400, "User is not associated with any organization");
    }

    const tasks = await Task.find({ 
      completed: false,
      organization: user.organization 
    })
    .populate('user', 'email')
    .skip(skip)
    .limit(limit);
    
    const totalTasks = await Task.countDocuments({ 
      completed: false,
      organization: user.organization 
    });

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

    // Get user's organization
    const user = await User.findById(req.user._id);
    if (!user.organization) {
      return errorResponse(res, 400, "User is not associated with any organization");
    }

    const tasks = await Task.find({ 
      completed: true,
      organization: user.organization 
    })
      .sort({ updatedAt: -1 })  // Sort by most recently updated first
      .populate('user', 'email')
      .skip(skip)
      .limit(limit);
      
    const totalTasks = await Task.countDocuments({ 
      completed: true,
      organization: user.organization 
    });

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
    
    // Update with the data from the request
    const updatedTask = await Task.findByIdAndUpdate(
      id, 
      req.body,
      { new: true } // Return the updated document
    ).populate('user', 'email'); // Populate user info
    
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
    
    // Delete the task
    await Task.findByIdAndDelete(id);
    
    successResponse(res, 200, "Task deleted successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
