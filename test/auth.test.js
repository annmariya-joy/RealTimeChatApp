const request = require('supertest');
const app = require('../app'); 
const db = require('../models');
const bcrypt = require('bcrypt');
const { generateAccessToken } = require('../config/utils/auth');
const mockdate = require('mockdate');


jest.mock('bcrypt');
jest.mock('../config/utils/auth');
jest.mock('../models', () => ({
  users: {
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  }
}));

describe('Auth Controller', () => {
  beforeAll(() => {
    mockdate.set('2024-09-04'); 
  });

  afterAll(() => {
    mockdate.reset(); 
  });

  describe('POST /api/users/login', () => {
    it('should log in a user with valid credentials', async () => {
      const mockUser = { role: 2, password: 'hashedpassword' };
      db.users.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateAccessToken.mockResolvedValue('fakeAccessToken');

      const response = await request(app)
        .post('/api/users/login')
        .set('Authorization', `Basic ${Buffer.from('user@example.com:password').toString('base64')}`)
        .expect(200);

      expect(response.body.message).toBe('Login successful.');
      expect(response.body.accessToken).toBe('fakeAccessToken');
    });

    it('should return 401 for incorrect password', async () => {
      const mockUser = { role: 2, password: 'hashedpassword' };
      db.users.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/users/login')
        .set('Authorization', `Basic ${Buffer.from('user@example.com:password').toString('base64')}`)
        .expect(401);

      expect(response.body.message).toBe('Your password does not match.');
    });

    it('should return 401 for missing authorization header', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .expect(401);

      expect(response.body.message).toBe('Authorization header is missing.');
    });
  });

  describe('POST /api/users/signup', () => {
    it('should sign up a new user', async () => {
      db.users.count.mockResolvedValue(0); 
      bcrypt.hash.mockResolvedValue('hashedpassword');
      db.users.create.mockResolvedValue({
        role: 'user',
        user_name: 'Test User',
        email: 'user@example.com',
        password: 'hashedpassword'
      });
      generateAccessToken.mockResolvedValue({
        accessToken: 'fakeAccessToken',
        RefreshToken: 'fakeRefreshToken'
      });

      const response = await request(app)
        .post('/api/users/signup')
        .send({
          role: 'user',
          user_name: 'Test User',
          email: 'user@example.com',
          password: 'password'
        })
        .expect(200);

      expect(response.body.message).toBe('User created successfully.');
      expect(response.body.accessToken).toBe('fakeAccessToken');
      expect(response.body.refreshToken).toBe('fakeRefreshToken');
    });

    it('should return 400 for existing email', async () => {
      db.users.count.mockResolvedValue(1); 

      const response = await request(app)
        .post('/api/users/signup')
        .send({
          role: 'user',
          user_name: 'Test User',
          email: 'user@example.com',
          password: 'password'
        })
        .expect(400);

      expect(response.body.message).toBe('Already existing user.');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/users/signup')
        .send({
          role: 'user',
          user_name: 'Test User',
          email: 'user@example.com'
        })
        .expect(400);

      expect(response.body.message).toBe('Password is Missing.');
    });
  });
});
