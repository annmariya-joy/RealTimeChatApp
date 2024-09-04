const request = require('supertest');
const app = require('../app'); // Import the Express app
const db = require('../models');
const mockdate = require('mockdate');

// Mock the models
jest.mock('../config/utils/auth');
jest.setTimeout(10000);
jest.mock('../models', () => ({
  users: {
    findByPk: jest.fn()
  },
  messages: {
    create: jest.fn(),
    findAll: jest.fn()
  },
  groups: {
    findByPk: jest.fn()
  },
  group_messages: {
    create: jest.fn(),
    findAll: jest.fn()
  },
  group_members: {
    findAll: jest.fn(),
    findOne: jest.fn()
  }
}));

// Set up a mock for the socket.io instance
const io = {
  to: jest.fn(() => io),
  emit: jest.fn()
};

describe('Messages API', () => {
  beforeAll(() => {
    mockdate.set('2024-09-04'); // Set a fixed date for consistency
  });

  afterAll(() => {
    mockdate.reset(); // Reset the date mock
  });

  describe('POST /api/messages/send', () => {
    it('should send a message to another user', async () => {
      const mockReceiver = { user_id: 2 };
      const mockMessage = { message_body: 'Hello!', sender_id: 1, receiver_id: 2 };

      db.users.findByPk.mockResolvedValue(mockReceiver);
      db.messages.create.mockResolvedValue(mockMessage);

      const response = await request(app)
        .post('/api/messages/send')
        .set('Authorization', 'Bearer fakeToken') // Simulate user authentication
        .send({ receiver_id: 2, message_body: 'Hello!' })
        .expect(201);

      console.log(response.body); // Debugging line

      expect(response.body.message).toBe('Message sent successfully.');
      expect(response.body.data).toEqual(mockMessage);
    });

    it('should return 404 if receiver not found', async () => {
      db.users.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/messages/send')
        .set('Authorization', 'Bearer fakeToken') // Simulate user authentication
        .send({ receiver_id: 2, message_body: 'Hello!' })
        .expect(404);

      console.log(response.body); // Debugging line

      expect(response.body.message).toBe('Receiver not found.');
    });
  });

  describe('POST /api/messages/sendGroupMessage', () => {
    it('should send a message to a group', async () => {
      const mockGroup = { group_id: 1 };
      const mockGroupMessage = { group_id: 1, sender_id: 1, message_body: 'Group Hello!' };
      const mockGroupMembers = [{ user_id: 2 }, { user_id: 3 }];

      db.groups.findByPk.mockResolvedValue(mockGroup);
      db.group_messages.create.mockResolvedValue(mockGroupMessage);
      db.group_members.findAll.mockResolvedValue(mockGroupMembers);

      const response = await request(app)
        .post('/api/messages/sendGroupMessage')
        .set('Authorization', 'Bearer fakeToken') // Simulate user authentication
        .send({ group_id: 1, message_body: 'Group Hello!' })
        .expect(201);

      console.log(response.body); // Debugging line

      expect(response.body.message).toBe('Message sent to group successfully.');
      expect(response.body.groupMessage).toEqual(mockGroupMessage);
    }, 10000); 

    it('should return 404 if group not found', async () => {
      db.groups.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/messages/sendGroupMessage')
        .set('Authorization', 'Bearer fakeToken') // Simulate user authentication
        .send({ group_id: 1, message_body: 'Group Hello!' })
        .expect(404);

      console.log(response.body); // Debugging line

      expect(response.body.message).toBe('Group not found.');
    }, 10000); // Increase timeout
  });

  describe('GET /api/messages/:user_id', () => {
    it('should retrieve messages between users', async () => {
      const mockMessages = [{ message_body: 'Hello!' }, { message_body: 'Hi!' }];

      db.messages.findAll.mockResolvedValue(mockMessages);

      const response = await request(app)
        .get('/api/messages/2')
        .set('Authorization', 'Bearer fakeToken') // Simulate user authentication
        .expect(200);

      console.log(response.body); // Debugging line

      expect(response.body.data).toEqual(mockMessages);
    });
  });

  describe('GET /api/groupMessages/:group_id', () => {
    it('should retrieve all messages for a group', async () => {
      const mockMessages = [{ message_body: 'Group Hello!' }];
      const mockGroupMember = { user_id: 1 };

      db.group_members.findOne.mockResolvedValue(mockGroupMember);
      db.group_messages.findAll.mockResolvedValue(mockMessages);

      const response = await request(app)
        .get('/api/groupMessages/1')
        .set('Authorization', 'Bearer fakeToken') // Simulate user authentication
        .expect(200);

      console.log(response.body); // Debugging line

      expect(response.body.messages).toEqual(mockMessages);
    });

    it('should return 403 if the user is not a member of the group', async () => {
      db.group_members.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/groupMessages/1')
        .set('Authorization', 'Bearer fakeToken') // Simulate user authentication
        .expect(403);

      console.log(response.body); // Debugging line

      expect(response.body.message).toBe('You are not a member of this group.');
    });
  });
});
