const User = require("../models/users.model");
const { successResponse, errorResponse } = require("../utils/response");

exports.getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find().select("-password").skip(skip).limit(limit);
  const totalUsers = await User.countDocuments();

  return successResponse(res, 200, "Users retrieved successfully", {
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page,
  });
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
