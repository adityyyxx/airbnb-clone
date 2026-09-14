const authController = require('../controllers/authController');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

describe('Authentication Controller Suite', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('1. Login Safety & Google Account Protection', () => {
    it('should reject login if user signed up with Google (no password hash)', async () => {
      const googleUser = {
        _id: 'user_google_123',
        username: 'googleuser',
        email: 'googleuser@gmail.com',
        googleId: 'goog_9999',
        password: null // No password set
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(googleUser);

      const req = {
        body: { username: 'googleuser@gmail.com', password: 'SomePassword123!' },
        session: {}
      };
      const res = {
        render: jest.fn(),
        redirect: jest.fn()
      };

      await authController.postLogin(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'auth/login',
        expect.objectContaining({
          errorMessage: expect.stringContaining('Google')
        })
      );
    });

    it('should safely handle missing username or password without throwing TypeError', async () => {
      const req = {
        body: {}, // Missing username and password
        session: {}
      };
      const res = {
        render: jest.fn(),
        redirect: jest.fn()
      };

      expect(() => {
        authController.postLogin(req, res);
      }).not.toThrow();

      expect(res.render).toHaveBeenCalledWith(
        'auth/login',
        expect.objectContaining({
          errorMessage: 'Please enter both your username/email and password.'
        })
      );
    });
  });

  describe('2. Signup Validation', () => {
    it('should reject signup when passwords do not match', async () => {
      const req = {
        body: {
          username: 'validuser',
          email: 'user@example.com',
          password: 'password123',
          confirmPassword: 'differentPassword456'
        },
        session: {}
      };
      const res = {
        render: jest.fn(),
        redirect: jest.fn()
      };

      authController.postSignup(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'auth/signup',
        expect.objectContaining({
          errorMessage: 'Passwords do not match.'
        })
      );
    });

    it('should reject signup with invalid email format', async () => {
      const req = {
        body: {
          username: 'validuser',
          email: 'not-an-email',
          password: 'password123',
          confirmPassword: 'password123'
        },
        session: {}
      };
      const res = {
        render: jest.fn(),
        redirect: jest.fn()
      };

      authController.postSignup(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'auth/signup',
        expect.objectContaining({
          errorMessage: 'Please enter a valid email address.'
        })
      );
    });
  });
});
