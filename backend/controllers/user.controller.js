const User = require("../models/users.model");
const { successResponse, errorResponse } = require("../utils/response");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return successResponse(res, 200, "Users retrieved successfully", users);
  } catch (error) {
    return errorResponse(res, error.message);
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
