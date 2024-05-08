const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Create a new task
router.post('/', authMiddleware, taskController.createTask);

// Get all tasks
router.get('/', authMiddleware, taskController.getAllTasks);

// Get a single task by ID
router.get('/:id', authMiddleware, taskController.getTaskById);

// Update a task
router.put('/:id', authMiddleware, taskController.updateTask);

// Delete a task
router.delete('/:id', authMiddleware, taskController.deleteTask);

module.exports = router;
