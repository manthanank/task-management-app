const mongoose = require('mongoose');

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Task management
 *   - name: Authentication
 *     description: Authentication operations
 *   - name: Users
 *     description: User operations
 *   - name: Organizations
 *     description: Organization operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - user
 *         - organization
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: Task deadline
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High]
 *           description: Task priority level
 *         completed:
 *           type: boolean
 *           description: Task completion status
 *         user:
 *           type: string
 *           description: ID of the user assigned to the task
 *         organization:
 *           type: string
 *           description: ID of the organization the task belongs to
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         title: Complete project documentation
 *         description: Write comprehensive documentation for the project
 *         deadline: 2023-12-31T00:00:00.000Z
 *         priority: High
 *         completed: false
 *         user: 60d21b4667d0d8992e610c85
 *         organization: 60d21b4667d0d8992e610c86
 */
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  deadline: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Add organization reference
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
