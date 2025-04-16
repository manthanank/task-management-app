const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { auth, isAdmin } = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/tasks:
 *  post:
 *    tags:
 *      - Tasks
 *    summary: Create a new task
 *    description: Creates a new task (admin only)
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - title
 *              - userId
 *            properties:
 *              title:
 *                type: string
 *              description:
 *                type: string
 *              deadline:
 *                type: string
 *                format: date-time
 *              priority:
 *                type: string
 *                enum: [Low, Medium, High]
 *              userId:
 *                type: string
 *    responses:
 *      201:
 *        description: Task created successfully
 *      403:
 *        description: Access denied
 *      500:
 *        description: Server error
 */
router.post("/", auth, isAdmin, taskController.createTask);

/**
 * @swagger
 * /api/tasks:
 *  get:
 *    tags:
 *      - Tasks
 *    summary: Get all tasks
 *    description: Retrieves all tasks for the organization
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        description: Page number
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: Number of items per page
 *    responses:
 *      200:
 *        description: Tasks retrieved successfully
 *      500:
 *        description: Server error
 */
router.get("/", auth, taskController.getAllTasks);

/**
 * @swagger
 * /api/tasks/user:
 *  get:
 *    tags:
 *      - Tasks
 *    summary: Get all tasks for a user
 *    description: Retrieves all tasks assigned to the current user
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        description: Page number
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: Number of items per page
 *    responses:
 *      200:
 *        description: Tasks retrieved successfully
 *      500:
 *        description: Server error
 */
router.get("/user", auth, taskController.getAllTasksForUser);

/**
 * @swagger
 * /api/tasks/ongoing:
 *  get:
 *    tags:
 *      - Tasks
 *    summary: Get ongoing tasks
 *    description: Retrieves all uncompleted tasks
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        description: Page number
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: Number of items per page
 *    responses:
 *      200:
 *        description: Tasks retrieved successfully
 *      500:
 *        description: Server error
 */
router.get("/ongoing", auth, taskController.getOngoingTasks);

/**
 * @swagger
 * /api/tasks/completed:
 *  get:
 *    tags:
 *      - Tasks
 *    summary: Get completed tasks
 *    description: Retrieves all completed tasks
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        description: Page number
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: Number of items per page
 *    responses:
 *      200:
 *        description: Tasks retrieved successfully
 *      500:
 *        description: Server error
 */
router.get("/completed", auth, taskController.getCompletedTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *  get:
 *    tags:
 *      - Tasks
 *    summary: Get a task by ID
 *    description: Retrieves a single task by its ID
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Task ID
 *    responses:
 *      200:
 *        description: Task retrieved successfully
 *      404:
 *        description: Task not found
 *      500:
 *        description: Server error
 */
router.get("/:id", auth, taskController.getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *  put:
 *    tags:
 *      - Tasks
 *    summary: Update a task
 *    description: Updates an existing task
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Task ID
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *              description:
 *                type: string
 *              deadline:
 *                type: string
 *                format: date-time
 *              priority:
 *                type: string
 *                enum: [Low, Medium, High]
 *              completed:
 *                type: boolean
 *    responses:
 *      200:
 *        description: Task updated successfully
 *      404:
 *        description: Task not found
 *      500:
 *        description: Server error
 */
router.put("/:id", auth, taskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *  delete:
 *    tags:
 *      - Tasks
 *    summary: Delete a task
 *    description: Deletes a task by ID
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Task ID
 *    responses:
 *      200:
 *        description: Task deleted successfully
 *      404:
 *        description: Task not found
 *      500:
 *        description: Server error
 */
router.delete("/:id", auth, taskController.deleteTask);

module.exports = router;