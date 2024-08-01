const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { auth, isAdmin } = require("../middleware/auth.middleware");

// Create a new task
router.post("/", auth, isAdmin, taskController.createTask);

// Get all tasks
router.get("/", auth, taskController.getAllTasks);

// Get a single task by ID
router.get("/:id", auth, taskController.getTaskById);

// Update a task
router.put("/:id", auth, taskController.updateTask);

// Delete a task
router.delete("/:id", auth, taskController.deleteTask);

module.exports = router;
