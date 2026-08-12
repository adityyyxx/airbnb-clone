const jwtUtil = require('../utils/jwtUtil');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    // 1. Check for Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwtUtil.verifyToken(token);
        req.user = decoded;
        req.userId = decoded.userId || decoded.id || decoded._id;
        req.isLoggedIn = true;
        return next();
      } catch (jwtErr) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token.'
        });
      }
    }

    // 2. Fallback to Express Session (for browser requests)
    if (req.session && req.session.isLoggedIn && req.session.userId) {
      req.userId = req.session.userId;
      req.user = {
        userId: req.session.userId,
        userName: req.session.userName,
        userRole: req.session.userRole
      };
      req.isLoggedIn = true;
      return next();
    }

    // 3. Fallback for Passport authenticated user (Google OAuth)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      req.userId = req.user._id;
      req.isLoggedIn = true;
      return next();
    }

    // If API request (JSON expected)
    if (req.xhr || req.headers.accept?.includes('application/json') || req.path.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.'
      });
    }

    // If standard browser navigation
    return res.redirect('/login');
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};
