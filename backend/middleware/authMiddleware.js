const jwt = require('jsonwebtoken');
const { findUserById } = require('../config/userStore');

const JWT_SECRET = process.env.JWT_SECRET || 'intellify_super_secret_jwt_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await findUserById(decoded.id, decoded.role);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User profile not found.',
      });
    }

    const userObj = { ...user };
    delete userObj.password;

    req.user = userObj;
    req.role = decoded.role || user.role;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.role}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
  JWT_SECRET,
};
