const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user.model");
const Organization = require("../models/organization.model");
const { generateToken, successResponse, errorResponse } = require("../utils/response");
const { sendPasswordResetEmail } = require("../utils/email");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, organization, role, createOrg } = req.body;
    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    if (password.length < 8) {
      return errorResponse(res, 400, "Password must be at least 8 characters");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return errorResponse(res, 400, "User already exists");
    }

    const shouldCreateOrg = createOrg === true || role === 'admin';
    let targetOrg = null;

    if (organization && organization.trim()) {
      const orgName = organization.trim();
      const existingOrg = await Organization.findOne({ name: orgName });

      if (shouldCreateOrg) {
        if (existingOrg) {
          return errorResponse(res, 400, "This organization already exists. Please join as a member instead.");
        }
      } else {
        if (existingOrg) {
          targetOrg = existingOrg;
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const initialRole = shouldCreateOrg ? 'admin' : 'user';

    const newUser = new User({
      email: normalizedEmail,
      password: hashedPassword,
      role: initialRole
    });

    await newUser.save();

    let orgInfo = null;

    if (organization && organization.trim()) {
      const orgName = organization.trim();
      if (shouldCreateOrg) {
        const newOrg = await Organization.create({
          name: orgName,
          owner: newUser._id,
          members: [{ user: newUser._id, role: 'admin' }]
        });

        await User.findByIdAndUpdate(newUser._id, {
          $set: { organization: newOrg._id, role: 'admin' }
        });

        orgInfo = {
          id: newOrg._id,
          name: newOrg.name,
          role: 'admin'
        };
      } else if (targetOrg) {
        targetOrg.members.push({
          user: newUser._id,
          role: 'member'
        });
        await targetOrg.save();

        await User.findByIdAndUpdate(newUser._id, {
          $set: { organization: targetOrg._id }
        });

        orgInfo = {
          id: targetOrg._id,
          name: targetOrg.name,
          role: 'member'
        };
      }
    }

    const token = generateToken(newUser);

    return res.status(201).json({
      token,
      expiresIn: 3600,
      user: {
        _id: newUser._id,
        email: newUser.email,
        role: shouldCreateOrg ? 'admin' : 'user',
        organization: orgInfo
      },
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password').populate('organization', 'name');
    if (!user) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    const token = generateToken(user);
    return res.status(200).json({
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
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

exports.logout = (req, res) => {
  successResponse(res, 200, "User logged out");
};

exports.getUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    let query = {};

    if (currentUser.role !== 'super') {
      if (!currentUser.organization) {
        return errorResponse(res, 403, "User not associated with any organization");
      }
      query = { organization: currentUser.organization };
    }

    const users = await User.find(query).select('-password');
    successResponse(res, 200, "Users retrieved successfully", users);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 400, "Email is required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return successResponse(res, 200, "If an account with that email exists, a reset link has been sent");
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateModifiedOnly: true });

    await sendPasswordResetEmail(normalizedEmail, resetToken);

    successResponse(res, 200, "If an account with that email exists, a reset link has been sent");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return errorResponse(res, 400, "Token and password are required");
    }

    if (password.length < 8) {
      return errorResponse(res, 400, "Password must be at least 8 characters");
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return errorResponse(res, 400, "Invalid or expired reset token");
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateModifiedOnly: true });

    successResponse(res, 200, "Password has been reset successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
