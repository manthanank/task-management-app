const User = require("../models/user.model");
const { successResponse, errorResponse } = require("../utils/response");

exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id);
    let query = {};

    if (currentUser.role !== 'super') {
      if (!currentUser.organization) {
        return errorResponse(res, 403, "User not associated with any organization");
      }
      query = { organization: currentUser.organization };
    }

    const users = await User.find(query).select('-password').skip(skip).limit(limit);
    const totalUsers = await User.countDocuments(query);

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
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
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

    return successResponse(res, 200, "Organization users retrieved successfully", {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Get current user's profile with organization info and org role
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('organization', 'name _id');

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    let organizationRole = null;
    let joinedAt = null;

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

    const profile = {
      _id: user._id,
      email: user.email,
      role: user.role,
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
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const currentUser = await User.findById(req.user._id);
    if (currentUser.role !== 'super' && req.user._id.toString() !== req.params.id) {
      if (!currentUser.organization || !user.organization || user.organization.toString() !== currentUser.organization.toString()) {
        return errorResponse(res, 403, "Not authorized to view this user");
      }
    }

    return successResponse(res, 200, "User retrieved successfully", user);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }
    
    const currentUser = await User.findById(req.user._id);
    
    if (req.user._id.toString() !== id) {
      if (currentUser.role !== 'super') {
        if (currentUser.role !== 'admin' || !currentUser.organization || !user.organization || user.organization.toString() !== currentUser.organization.toString()) {
          return errorResponse(res, 403, "Not authorized to update this user");
        }
      }
    }
    
    const updateData = {};
    if (email) {
      updateData.email = email.toLowerCase().trim();
    }
    
    if (role && (currentUser.role === 'admin' || currentUser.role === 'super') && req.user._id.toString() !== id) {
      if (role === 'super' && currentUser.role !== 'super') {
        return errorResponse(res, 403, "Only super administrators can assign the super role");
      }
      if (!['user', 'admin', 'super'].includes(role)) {
        return errorResponse(res, 400, "Invalid role specified");
      }
      updateData.role = role;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id, updateData, { new: true, runValidators: true }
    ).select('-password');
    
    return successResponse(res, 200, "User updated successfully", updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, "Email already exists");
    }
    return errorResponse(res, 500, error.message);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }
    
    if (id === req.user._id.toString()) {
      return errorResponse(res, 400, "You cannot delete your own account");
    }

    const currentUser = await User.findById(req.user._id);
    if (currentUser.role !== 'super') {
      if (currentUser.role !== 'admin' || !currentUser.organization || !user.organization || user.organization.toString() !== currentUser.organization.toString()) {
        return errorResponse(res, 403, "Not authorized to delete this user");
      }
    }
    
    await User.findByIdAndDelete(id);
    
    return successResponse(res, 200, "User deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
