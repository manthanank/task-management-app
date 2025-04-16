const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       required:
 *         - name
 *         - owner
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Organization name
 *         owner:
 *           type: string
 *           description: ID of the user who owns the organization
 *         members:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: ID of the user who is a member of the organization
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: Role of the user in the organization
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the organization was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the organization was last updated
 *       example:
 *         _id: 60d21b4667d0d8992e610c86
 *         name: Example Organization
 *         owner: 60d21b4667d0d8992e610c85
 *         members:
 *           - user: 60d21b4667d0d8992e610c85
 *             role: admin
 *           - user: 60d21b4667d0d8992e610c87
 *             role: user
 *         createdAt: 2023-06-23T10:00:00.000Z
 *         updatedAt: 2023-06-24T15:30:00.000Z
 */
const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;