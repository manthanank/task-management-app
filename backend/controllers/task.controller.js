const Task = require("../models/task.model");
const { successResponse, errorResponse } = require("../utils/response");

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority, userId } = req.body;
    const newTask = new Task({
      title,
      description,
      deadline,
      priority,
      user: userId,
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

    const tasks = await Task.find().skip(skip).limit(limit);
    const totalTasks = await Task.countDocuments();

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
    const { title, description, deadline, priority, completed } = req.body;
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, deadline, priority, completed },
      { new: true }
    );
    if (!updatedTask) {
      return errorResponse(res, 404, "Task not found");
    }
    successResponse(res, 200, "Task updated successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!deletedTask) {
      return errorResponse(res, 404, "Task not found");
    }
    successResponse(res, 200, "Task deleted successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get ongoing tasks
exports.getOngoingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ completed: false });
    successResponse(res, 200, "Ongoing tasks retrieved successfully", tasks);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get completed tasks
exports.getCompletedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ completed: true });
    successResponse(res, 200, "Completed tasks retrieved successfully", tasks);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get paginated ongoing tasks
exports.getPaginatedOngoingTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ completed: false }).skip(skip).limit(limit);
    const totalTasks = await Task.countDocuments({ completed: false });

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

// Get paginated completed tasks
exports.getPaginatedCompletedTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ completed: true }).skip(skip).limit(limit);
    const totalTasks = await Task.countDocuments({ completed: true });

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
