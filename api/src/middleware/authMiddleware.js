const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token - check both patients and doctors tables
      let [rows] = await pool.execute(
        'SELECT email, CONCAT(first_name, " ", last_name) as name, "patient" as user_type FROM patients WHERE email = ?',
        [decoded.email]
      );

      if (rows.length === 0) {
        [rows] = await pool.execute(
          'SELECT email, CONCAT(first_name, " ", last_name) as name, "doctor" as user_type FROM doctors WHERE email = ?',
          [decoded.email]
        );
      }

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = rows[0];
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.user_type} is not authorized to access this route`
      });
    }

    next();
  };
};

module.exports = { protect, authorize };

