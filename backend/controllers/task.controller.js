const Task = require('../models/task.model');
const { successResponse, errorResponse } = require('../utils/response');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority } = req.body;
    const newTask = new Task({
      title,
      description,
      deadline,
      priority,
      user: req.user._id,
    });
    await newTask.save();
    successResponse(res, 201, 'Task created successfully', newTask);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    successResponse(res, 200, 'Tasks retrieved successfully', tasks);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return errorResponse(res, 404, 'Task not found');
    }
    successResponse(res, 200, 'Task retrieved successfully', task);
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
      return errorResponse(res, 404, 'Task not found');
    }
    successResponse(res, 200, 'Task updated successfully', updatedTask);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deletedTask) {
      return errorResponse(res, 404, 'Task not found');
    }
    successResponse(res, 200, 'Task deleted successfully', deletedTask);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
