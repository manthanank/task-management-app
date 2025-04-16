const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization.controller');
const userController = require('../controllers/user.controller'); // Add this import
const { auth, isAdmin } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get all organizations
 *     description: Retrieve a list of all organizations (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of organizations
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
router.get('/', auth, isAdmin, organizationController.getAllOrganizations);

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Create a new organization
 *     description: Create a new organization (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Organization name
 *     responses:
 *       201:
 *         description: Organization created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
router.post('/', auth, isAdmin, organizationController.createOrganization);

/**
 * @swagger
 * /api/organizations/my:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get current user's organization
 *     description: Retrieve the organization associated with the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error
 */
router.get('/my', auth, organizationController.getMyOrganization);

/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get organization by ID
 *     description: Retrieve an organization by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error
 */
router.get('/:id', auth, organizationController.getOrganizationById);

/**
 * @swagger
 * /api/organizations/{id}:
 *   put:
 *     tags:
 *       - Organizations
 *     summary: Update an organization
 *     description: Update an organization by ID (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Organization name
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, isAdmin, organizationController.updateOrganization);

/**
 * @swagger
 * /api/organizations/{id}:
 *   delete:
 *     tags:
 *       - Organizations
 *     summary: Delete an organization
 *     description: Delete an organization by ID (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, isAdmin, organizationController.deleteOrganization);

/**
 * @swagger
 * /api/organizations/{id}/members:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get organization members
 *     description: Get all members of an organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: List of organization members
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error
 */
router.get('/:id/members', auth, organizationController.getOrganizationMembers);

/**
 * @swagger
 * /api/organizations/{id}/members:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Add member to organization
 *     description: Add a user to an organization (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to add to organization
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *                 description: Role of the user in the organization
 *     responses:
 *       200:
 *         description: Member added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Organization or user not found
 *       500:
 *         description: Server error
 */
router.post('/:id/members', auth, isAdmin, organizationController.addMemberToOrganization);

module.exports = router;