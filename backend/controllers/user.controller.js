const User = require("../models/user.model");
const { successResponse, errorResponse } = require("../utils/response");

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find().select("-password").skip(skip).limit(limit);
    // Get total count of all users for pagination
    const totalUsers = await User.countDocuments();

    return successResponse(res, 200, "Users retrieved successfully", {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Get users by organization
exports.getUsersByOrganization = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    // Get the current user's organization
    const user = await User.findById(req.user._id);
    if (!user.organization) {
      return errorResponse(res, 400, "User is not associated with any organization");
    }

    // Find all users in the same organization
    const users = await User.find({ 
      organization: user.organization 
    })
    .select('-password') // Exclude password
    .skip(skip)
    .limit(limit);

    const totalUsers = await User.countDocuments({ organization: user.organization });

    successResponse(res, 200, "Organization users retrieved successfully", {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get current user's profile with organization info and org role
exports.getProfile = async (req, res) => {
  try {
    // Populate organization info
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('organization', 'name _id'); // Add more fields if needed

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    let organizationRole = null;
    let joinedAt = null;

    // If user has an organization, find their role and join date from org.members
    if (user.organization) {
      const Organization = require("../models/organization.model");
      const org = await Organization.findById(user.organization._id);
      if (org) {
        const member = org.members.find(
          m => m.user.toString() === user._id.toString()
        );
        if (member) {
          organizationRole = member.role;
          joinedAt = member.joinedAt;
        }
      }
    }

    // Build profile response
    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      organization: user.organization,
      organizationRole,
      joinedAt,
    };

    return successResponse(res, 200, "Profile retrieved successfully", profile);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    return successResponse(res, 200, "User retrieved successfully", user);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    
    // Check if the user exists
    const user = await User.findById(id);
    
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }
    
    // Check permissions - only admins can update other users' roles
    // Regular users can only update their own details but not their role
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return errorResponse(res, 403, "Not authorized to update this user");
    }
    
    // Prepare update object
    const updateData = {};
    
    if (email) {
      updateData.email = email;
    }
    
    // Only admins can change roles
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }
    
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    return successResponse(res, 200, "User updated successfully", updatedUser);
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return errorResponse(res, 400, "Email already exists");
    }
    return errorResponse(res, 500, error.message);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the user exists
    const user = await User.findById(id);
    
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }
    
    // Prevent admins from deleting themselves as a safety measure
    if (id === req.user._id.toString()) {
      return errorResponse(res, 400, "You cannot delete your own account");
    }
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    return successResponse(res, 200, "User deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
