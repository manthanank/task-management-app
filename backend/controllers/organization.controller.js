const Organization = require('../models/organization.model');
const { successResponse, errorResponse } = require('../utils/response');

// Create a new organization
exports.createOrganization = async (req, res) => {
  try {
    const { name, description } = req.body;

    const newOrganization = new Organization({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await newOrganization.save();
    successResponse(res, 201, "Organization created successfully", newOrganization);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get all organizations for current user
exports.getMyOrganizations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
    const user = await require('../models/user.model').findById(req.user._id).populate('organization');
    if (!user || !user.organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    return res.status(200).json({ organization: user.organization });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

    // Allow super admin to access any organization
    const user = await require('../models/user.model').findById(req.user._id);
    if (user.role === 'super') {
      return successResponse(res, 200, "Organization retrieved successfully", organization);
    }

    // Check if user is a member of the organization
    const isMember = organization.members.some(member =>
      member.user._id.toString() === req.user._id.toString()
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

    // Check if user is the owner or admin
    const memberRecord = organization.members.find(member =>
      member.user.toString() === req.user._id.toString()
    );

    if (!memberRecord || (memberRecord.role !== 'admin' &&
        organization.owner.toString() !== req.user._id.toString())) {
      return errorResponse(res, 403, "Not authorized to update organization");
    }

    const updatedOrganization = await Organization.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );

    successResponse(res, 200, "Organization updated successfully", updatedOrganization);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Add member to organization
exports.addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return errorResponse(res, 404, "Organization not found");
    }

    // Check if user is the owner or admin
    const memberRecord = organization.members.find(member =>
      member.user.toString() === req.user._id.toString()
    );

    if (!memberRecord || (memberRecord.role !== 'admin' &&
        organization.owner.toString() !== req.user._id.toString())) {
      return errorResponse(res, 403, "Not authorized to add members");
    }

    // Check if user is already a member
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

    successResponse(res, 200, "Member added successfully", organization);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Remove member from organization
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return errorResponse(res, 404, "Organization not found");
    }

    // Check if user is the owner or admin
    const memberRecord = organization.members.find(member =>
      member.user.toString() === req.user._id.toString()
    );

    if (!memberRecord || (memberRecord.role !== 'admin' &&
        organization.owner.toString() !== req.user._id.toString())) {
      return errorResponse(res, 403, "Not authorized to remove members");
    }

    // Cannot remove the owner
    if (organization.owner.toString() === userId) {
      return errorResponse(res, 400, "Cannot remove the organization owner");
    }

    organization.members = organization.members.filter(
      member => member.user.toString() !== userId
    );

    await organization.save();

    successResponse(res, 200, "Member removed successfully", organization);
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

    // Only owner can delete organization
    if (organization.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Only the organization owner can delete it");
    }

    await Organization.findByIdAndDelete(req.params.id);

    successResponse(res, 200, "Organization deleted successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get all organizations (admin only)
exports.getAllOrganizations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
      .populate('members.user', 'email name');

    if (!organization) {
      return errorResponse(res, 404, "Organization not found");
    }

    // Check if user is a member of the organization
    const isMember = organization.members.some(member =>
      member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return errorResponse(res, 403, "Access denied");
    }

    successResponse(res, 200, "Organization members retrieved successfully", organization.members);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Add member to organization (renamed from addMember for consistency with route)
exports.addMemberToOrganization = async (req, res) => {
  try {
    const { userId, role = 'user' } = req.body;

    if (!userId) {
      return errorResponse(res, 400, "User ID is required");
    }

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return errorResponse(res, 404, "Organization not found");
    }

    // Check if user is already a member
    const isAlreadyMember = organization.members.some(member =>
      member.user.toString() === userId
    );

    if (isAlreadyMember) {
      return errorResponse(res, 400, "User is already a member of this organization");
    }

    organization.members.push({
      user: userId,
      role: role
    });

    await organization.save();

    const updatedOrganization = await Organization.findById(req.params.id)
      .populate('members.user', 'email name');

    successResponse(res, 200, "Member added successfully", updatedOrganization);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
