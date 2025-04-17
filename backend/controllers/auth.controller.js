const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Organization = require("../models/organization.model");
const { generateToken, successResponse, errorResponse } = require("../utils/response");
const crypto = require("crypto");

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *         expiresIn:
 *           type: integer
 *           description: Token expiration in seconds
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: User ID
 *             email:
 *               type: string
 *               description: User email
 *             role:
 *               type: string
 *               description: User role
 *             organization:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Organization ID
 *                 name:
 *                   type: string
 *                   description: Organization name
 *                 role:
 *                   type: string
 *                   description: User's role in the organization
 *         success:
 *           type: boolean
 *           description: Success status
 *         message:
 *           type: string
 *           description: Response message
 */

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, organization, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    let userRole = (role === 'admin' || role === 'super') ? role : 'user';

    // If organization exists and user wants to be admin, check if org already has an admin
    if (organization && userRole === 'admin') {
      const existingOrg = await Organization.findOne({ name: organization });
      if (existingOrg) {
        return res.status(400).json({
          message: "This organization already exists. Please join as a member instead.",
          suggestRole: 'member'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      role: userRole // Set the role based on the user's selection
    });
    await newUser.save();
    const token = generateToken(newUser);

    let orgInfo = null;

    // If organization name is provided, create an organization (for admin users)
    if (organization && userRole === 'admin') {
      const newOrg = await Organization.create({
        name: organization,
        owner: newUser._id,
        members: [{ user: newUser._id, role: 'admin' }]
      });

      // Store the organization info for response
      orgInfo = {
        id: newOrg._id,
        name: newOrg.name,
        role: 'admin'
      };

      // Update the user with organization reference
      await User.findByIdAndUpdate(newUser._id, {
        $set: { organization: newOrg._id }
      });

      console.log(`Created organization ${newOrg.name} with user ${newUser.email} as admin`);
    }
    // If user is joining an existing organization (for regular users)
    else if (organization) {
      // Find the organization by name instead of ID
      const existingOrg = await Organization.findOne({ name: organization });
      if (existingOrg) {
        // Add user to organization members
        existingOrg.members.push({
          user: newUser._id,
          role: 'member'
        });
        await existingOrg.save();

        // Update user with organization reference
        await User.findByIdAndUpdate(newUser._id, {
          $set: { organization: existingOrg._id }
        });

        orgInfo = {
          id: existingOrg._id,
          name: existingOrg.name,
          role: 'member'
        };

        console.log(`Added user ${newUser.email} to organization ${existingOrg.name}`);
      }
    }

    res
      .status(201)
      .json({
        token,
        expiresIn: 3600,
        user: {
          _id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          organization: orgInfo
        },
        success: true,
        message: 'User registered successfully'
      });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message, success: false });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user);
    res.status(200).json({
      token,
      expiresIn: 3600,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        organization: user.organization ? {
          id: user.organization._id,
          name: user.organization.name,
        } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User logout
exports.logout = (req, res) => {
  res.status(200).json({ message: "User logged out" });
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    // Implementation...
  } catch (error) {
    // Error handling...
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    // Implementation...
  } catch (error) {
    // Error handling...
  }
};
