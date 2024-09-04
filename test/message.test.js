const request = require('supertest');
const app = require('../app'); // Import the Express app
const db = require('../models');
const mockdate = require('mockdate');
const { sendMessage, sendGroupMessage } = require('../controllers/messageController');

// Mock the models and console.error
jest.mock('../models', () => ({
  users: {
    findByPk: jest.fn().mockImplementation((userId) =>
      Promise.resolve({
        user_id: userId,
        user_name: 'Test User',
      })
    ),
  },
  messages: {
    create: jest.fn(),
    findAll: jest.fn(), // Added this mock if needed for other tests
  },
  groups: {
    findByPk: jest.fn(),
  },
  group_messages: {
    create: jest.fn(),
  },
  group_members: {
    findAll: jest.fn(),
    findOne: jest.fn(), // Added this mock if needed for other tests
  },
}));

// Mock the console.error
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

// Set up a mock for the socket.io instance
const mockSocket = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

describe('sendMessage', () => {
    const req = {
      body: {
        receiver_id: 1,
        message_body: 'Hello!',
      },
      user: { userId: 123 },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    beforeEach(() => {
      jest.clearAllMocks(); // Reset mocks before each test
    });
  
    it('handles errors', async () => {
      db.messages.create.mockRejectedValue(new Error('Database error'));
  
      await sendMessage(mockSocket)(req, res);
  
      expect(console.error).toHaveBeenCalledWith('Error sending message:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error.' });
    });
  });
  
  describe('sendGroupMessage', () => {
    const req = {
      body: {
        group_id: 1,
        message_body: 'Group message!',
      },
      user: { userId: 123 },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    beforeEach(() => {
      jest.clearAllMocks(); // Reset mocks before each test
      console.error = jest.fn(); // Mock console.error
    });
  
    it('handles errors', async () => {
        db.group_messages.create.mockRejectedValue(new Error('Database error'));
      
        await sendGroupMessage(mockSocket)(req, res);
      
        expect(console.error).toHaveBeenCalledWith('Error sending group message:', expect.any(Error));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to send group message.', error: expect.any(Error) });
      });
      
  });
  