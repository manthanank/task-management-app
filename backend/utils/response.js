require("dotenv").config();
const jwt = require("jsonwebtoken");

const createResponse = (res, status, message, data = null) => {
  const response = { status: status === 200 ? "success" : "error", message };
  if (data) response.data = data;
  res.status(status).json(response);
};

const successResponse = (res, status, message, data) =>
  createResponse(res, status, message, data);

const errorResponse = (res, status, message) =>
  createResponse(res, status, message);

const generateToken = (user) =>
  jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

module.exports = { successResponse, errorResponse, generateToken };
