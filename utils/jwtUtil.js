const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'airbnb_jwt_fallback_secret_keepcoding_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT token for a user
 * @param {Object} payload - { userId, email, role, username }
 * @returns {String} token
 */
exports.generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a JWT token
 * @param {String} token
 * @returns {Object} decoded payload
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
