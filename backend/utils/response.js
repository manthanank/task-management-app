require("dotenv").config();
const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not configured");
  }
  return secret;
};

const createResponse = (res, status, message, data = null) => {
  const response = { status: status >= 200 && status < 300 ? "success" : "error", message };
  if (data !== null && data !== undefined) response.data = data;
  res.status(status).json(response);
};

const successResponse = (res, status, message, data) =>
  createResponse(res, status, message, data);

const errorResponse = (res, status, message) =>
  createResponse(res, status, message);

const generateToken = (user) => {
  const secret = getJwtSecret();
  return jwt.sign({ _id: user._id }, secret, { expiresIn: "1h" });
};

module.exports = { successResponse, errorResponse, generateToken, getJwtSecret };
