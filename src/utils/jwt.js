import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key_change_this_in_production';
const JWT_EXPIRATION = '1d'; // Token expiration time

export const jwttoken = {
  sign: (payload) => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    } catch (error) {
      logger.error('Error signing JWT token:', error);
      throw new Error('Failed to authenticate user', { cause: error });
    }
  },
  verify: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('Error verifying JWT token:', error);
      throw new Error('Invalid or expired token', { cause: error });
    }
  }
};