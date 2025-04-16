const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * /api/auth/register:
 *  post:
 *    tags:
 *      - Authentication
 *    summary: Register a new user
 *    description: Creates a new user account
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *              password:
 *                type: string
 *                format: password
 *              organization:
 *                type: string
 *              role:
 *                type: string
 *                enum: [user, admin]
 *    responses:
 *      201:
 *        description: User registered successfully
 *      400:
 *        description: User already exists
 *      500:
 *        description: Server error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *  post:
 *    tags:
 *      - Authentication
 *    summary: Login user
 *    description: Authenticates a user and returns a JWT token
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *              password:
 *                type: string
 *                format: password
 *    responses:
 *      200:
 *        description: Login successful
 *      401:
 *        description: Invalid credentials
 *      404:
 *        description: User not found
 *      500:
 *        description: Server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *  post:
 *    tags:
 *      - Authentication
 *    summary: Logout user
 *    description: Logs out the current user
 *    responses:
 *      200:
 *        description: User logged out
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/users:
 *  get:
 *    tags:
 *      - Authentication
 *    summary: Get all users
 *    description: Retrieves a list of all users
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of users
 *      500:
 *        description: Server error
 */
router.get('/users', authController.getUsers);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Forgot password
 *     description: Request a password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password
 *     description: Reset password using token received in email
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
