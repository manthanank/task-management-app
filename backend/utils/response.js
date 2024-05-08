const successResponse = (res, status, message, data) => {
    res.status(status).json({
      status: 'success',
      message,
      data,
    });
  };
  
  const errorResponse = (res, status, message) => {
    res.status(status).json({
      status: 'error',
      message,
    });
  };
  
  const generateToken = (user) => {
    return jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' });
  };
  
  module.exports = { successResponse, errorResponse, generateToken };
  