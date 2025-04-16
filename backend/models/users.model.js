const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         email:
 *           type: string
 *           description: User's email address
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User's role
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         email: user@example.com
 *         role: user
 */

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

const Users = mongoose.model("Users", userSchema);

module.exports = Users;