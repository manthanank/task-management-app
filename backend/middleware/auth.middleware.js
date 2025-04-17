const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { errorResponse } = require('../utils/response');

const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return errorResponse(res, 401, 'Authentication required');
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return errorResponse(res, 401, 'Authentication token is missing');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired token');
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== 'admin' && user.role !== 'super') {
      return res.status(403).send({ error: 'Access denied' });
    }
    next();
  } catch (error) {
    return errorResponse(res, error);
  }
};

const organizationAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('organization');
    if (!user.organization) {
      return errorResponse(res, 403, "User not associated with any organization");
    }

    // Check if user is admin in their organization
    if (user.role !== 'admin') {
      return errorResponse(res, 403, "Access denied: Requires organization admin privileges");
    }

    // Add organization to request object for controllers to use
    req.organization = user.organization;
    next();
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { auth, isAdmin, organizationAdmin };
