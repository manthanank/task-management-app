const Organization = require('../models/organization.model');
const User = require('../models/user.model');
const { successResponse, errorResponse } = require('../utils/response');

// Create a new organization
exports.createOrganization = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return errorResponse(res, 400, "Organization name is required");
    }

    const existingOrg = await Organization.findOne({ name: name.trim() });
    if (existingOrg) {
      return errorResponse(res, 400, "An organization with this name already exists");
    }

    const newOrganization = new Organization({
      name: name.trim(),
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await newOrganization.save();

    await User.findByIdAndUpdate(req.user._id, {
      $set: { organization: newOrganization._id, role: 'admin' }
    });

    successResponse(res, 201, "Organization created successfully", newOrganization);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get all organizations for current user
exports.getMyOrganizations = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const organizations = await Organization.find({
      'members.user': req.user._id
    })
      .populate('owner', 'email')
      .skip(skip)
      .limit(limit);

    const totalOrganizations = await Organization.countDocuments({
      'members.user': req.user._id
    });

    successResponse(res, 200, "Organizations retrieved successfully", {
      organizations,
      totalOrganizations,
      totalPages: Math.ceil(totalOrganizations / limit),
      currentPage: page,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

exports.getMyOrganization = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('organization');
    if (!user || !user.organization) {
      return errorResponse(res, 404, "Organization not found");
    }
    return successResponse(res, 200, "Organization retrieved successfully", user.organization);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Get organization by ID
exports.getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('owner', 'email')
      .populate('members.user', 'email');

    if (!organization) {
      return errorResponse(res, 404, "Organization not found");
    }

    const currentUser = await User.findById(req.user._id);
    if (currentUser.role === 'super') {
      return successResponse(res, 200, "Organization retrieved successfully", organization);
    }

    const isMember = organization.members.some(member =>
      member.user?._id?.toString() === req.user._id.toString() ||
      member.user?.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return errorResponse(res, 403, "Access denied");
    }

    successResponse(res, 200, "Organization retrieved successfully", organization);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Update organization
exports.updateOrganization = async (req, res) => {
  try {
    const { name, description } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return errorResponse(res, 404, "Organization not found");
    }

    const currentUser = await User.findById(req.user._id);
    if (currentUser.role !== 'super') {
      const memberRecord = organization.members.find(member =>
        member.user.toString() === req.user._id.toString()
      );

      if (!memberRecord || (memberRecord.role !== 'admin' &&
          organization.owner.toString() !== req.user._id.toString())) {
        return errorResponse(res, 403, "Not authorized to update organization");
      }
    }

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (description !== undefined) updateFields.description = description;

    const updatedOrganization = await Organization.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    )
      .populate('owner', 'email')
      .populate('members.user', 'email');

    successResponse(res, 200, "Organization updated successfully", updatedOrganization);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Add member to organization
exports.addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId) {
      return errorResponse(res, 400, "User ID is required");
    }

    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return errorResponse(res, 404, "Organization not found");
    }

    const currentUser = await User.findById(req.user._id);
    if (currentUser.role !== 'super') {
      const memberRecord = organization.members.find(member =>
        member.user.toString() === req.user._id.toString()
      );

      if (!memberRecord || (memberRecord.role !== 'admin' &&
          organization.owner.toString() !== req.user._id.toString())) {
        return errorResponse(res, 403, "Not authorized to add members");
      }
    }

    const isAlreadyMember = organization.members.some(member =>
      member.user.toString() === userId
    );

    if (isAlreadyMember) {
      return errorResponse(res, 400, "User is already a member of this organization");
    }

    organization.members.push({
      user: userId,
      role: role || 'member'
    });

    await organization.save();
    await User.findByIdAndUpdate(userId, { $set: { organization: organization._id } });

    const populatedOrg = await Organization.findById(req.params.id)
      .populate('owner', 'email')
      .populate('members.user', 'email');

    successResponse(res, 200, "Member added successfully", populatedOrg);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Remove member from organization
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return errorResponse(res, 400, "User ID is required");
    }

    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return errorResponse(res, 404, "Organization not found");
    }

    const currentUser = await User.findById(req.user._id);
    if (currentUser.role !== 'super') {
      const memberRecord = organization.members.find(member =>
        member.user.toString() === req.user._id.toString()
      );

      if (!memberRecord || (memberRecord.role !== 'admin' &&
          organization.owner.toString() !== req.user._id.toString())) {
        return errorResponse(res, 403, "Not authorized to remove members");
      }
    }

    if (organization.owner.toString() === userId) {
      return errorResponse(res, 400, "Cannot remove the organization owner");
    }

    organization.members = organization.members.filter(
      member => member.user.toString() !== userId
    );

    await organization.save();
    await User.findByIdAndUpdate(userId, { $unset: { organization: 1 } });

    const populatedOrg = await Organization.findById(req.params.id)
      .populate('owner', 'email')
      .populate('members.user', 'email');

    successResponse(res, 200, "Member removed successfully", populatedOrg);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Delete organization
exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return errorResponse(res, 404, "Organization not found");
    }

    const currentUser = await User.findById(req.user._id);
    if (currentUser.role !== 'super' && organization.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Only the organization owner or a super admin can delete it");
    }

    await User.updateMany(
      { organization: req.params.id },
      { $unset: { organization: 1 } }
    );

    await Organization.findByIdAndDelete(req.params.id);

    successResponse(res, 200, "Organization deleted successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get all organizations (super/admin only)
exports.getAllOrganizations = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const organizations = await Organization.find()
      .populate('owner', 'email')
      .skip(skip)
      .limit(limit);

    const totalOrganizations = await Organization.countDocuments();

    successResponse(res, 200, "All organizations retrieved successfully", {
      organizations,
      totalOrganizations,
      totalPages: Math.ceil(totalOrganizations / limit),
      currentPage: page,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get organization members
exports.getOrganizationMembers = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('members.user', 'email');

    if (!organization) {
      return errorResponse(res, 404, "Organization not found");
    }

    const currentUser = await User.findById(req.user._id);
    if (currentUser.role !== 'super') {
      const isMember = organization.members.some(member =>
        member.user?._id?.toString() === req.user._id.toString() ||
        member.user?.toString() === req.user._id.toString()
      );

      if (!isMember) {
        return errorResponse(res, 403, "Access denied");
      }
    }

    successResponse(res, 200, "Organization members retrieved successfully", organization.members);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

exports.addMemberToOrganization = async (req, res) => {
  return exports.addMember(req, res);
};
