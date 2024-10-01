const request = require('supertest');
const app = require('../app');
const db = require('../models');
const mockdate = require('mockdate');
const { sendMessage, getMessages, sendGroupMessage, getGroupMessages } = require('../controllers/messageController');

jest.mock('../models');

describe('Message Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {

    mockReq = {
      params: {},
      user: { userId: 1 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMessages', () => {
    it('should retrieve messages and return them', async () => {
      mockReq.params.user_id = 2;

      db.messages.findAll.mockResolvedValue([{ message_id: 1, message_body: 'Hello!', sender_id: 1, receiver_id: 2 }]);

      await getMessages(mockReq, mockRes);

      expect(db.messages.findAll).toHaveBeenCalledWith({
        where: {
          sender_id: 1,
          receiver_id: 2,
        },
        order: [['created_at', 'ASC']],
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: [{ message_id: 1, message_body: 'Hello!', sender_id: 1, receiver_id: 2 }],
      });
    });

    it('should return 500 on error', async () => {
      db.messages.findAll.mockRejectedValue(new Error('Database error'));

      await getMessages(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to retrieve messages.', error: expect.anything() });
    });
  });
});


describe('Message Controller', () => {
  let mockReq, mockRes, mockIo;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { userId: 1 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockIo = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send a message and emit an event', async () => {
      mockReq.body = {
        receiver_id: 2,
        message_body: 'Hello, world!',
      };

      db.users.findByPk.mockResolvedValue({ userId: 2 });
      db.messages.create.mockResolvedValue({ message_id: 1, message_body: 'Hello, world!', sender_id: 1, receiver_id: 2 });

      await sendMessage(mockIo)(mockReq, mockRes);
      expect(db.users.findByPk).toHaveBeenCalledWith(2);
      expect(db.messages.create).toHaveBeenCalledWith({
        message_body: 'Hello, world!',
        sender_id: 1,
        receiver_id: 2,
      });
      expect(mockIo.to).toHaveBeenCalledWith(2);
      expect(mockIo.emit).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Message sent successfully.',
        data: { message_id: 1, message_body: 'Hello, world!', sender_id: 1, receiver_id: 2 },
      });
    });

    it('should return 404 if receiver not found', async () => {
      db.users.findByPk.mockResolvedValue(null);

      await sendMessage(mockIo)(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Receiver not found.' });
    });

    it('should return 500 on error', async () => {
      db.users.findByPk.mockRejectedValue(new Error('Database error'));
      await sendMessage(mockIo)(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to send message.', error: expect.anything() });
    });
  });
});


describe('Message Controller', () => {
  let mockReq, mockRes, mockIo;

  beforeEach(() => {
    mockReq = {
      body: {},

      user: { userId: 1 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockIo = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendGroupMessage', () => {
    it('should send a group message and emit an event', async () => {
      mockReq.body = {
        group_id: 1,
        message_body: 'Hello, group!',
      };

      db.groups.findByPk.mockResolvedValue({ group_id: 1 });
      db.group_messages.create.mockResolvedValue({
        group_id: 1,
        message_body: 'Hello, group!',
        sender_id: 1,
      });
      db.group_members.findAll.mockResolvedValue([{ user_id: 2 }, { user_id: 3 }]);

      await sendGroupMessage(mockIo)(mockReq, mockRes);

      expect(db.groups.findByPk).toHaveBeenCalledWith(1);
      expect(db.group_messages.create).toHaveBeenCalledWith({
        group_id: 1,
        sender_id: 1,
        message_body: 'Hello, group!',
      });
      expect(mockIo.to).toHaveBeenCalledWith(2);
      expect(mockIo.to).toHaveBeenCalledWith(3);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Message sent to group successfully.',
        groupMessage: { group_id: 1, message_body: 'Hello, group!', sender_id: 1 },
      });
    });

    it('should return 404 if group not found', async () => {
      db.groups.findByPk.mockResolvedValue(null);

      await sendGroupMessage(mockIo)(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Group not found.' });
    });

    it('should return 500 on error', async () => {
      db.groups.findByPk.mockRejectedValue(new Error('Database error'));

      await sendGroupMessage(mockIo)(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to send group message.', error: expect.anything() });
    });
  });
});



describe('Message Controller', () => {
  let mockReq, mockRes, mockIo;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      user: { userId: 1 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockIo = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
  });

  describe('getGroupMessages', () => {
    it('should retrieve group messages if user is a member', async () => {
      mockReq.params = { group_id: 1 };
      db.group_members.findOne.mockResolvedValue({ group_id: 1, user_id: 1 });
      db.group_messages.findAll.mockResolvedValue([{ message_id: 1, message_body: 'Hello, group!', group_id: 1 }]);

      await getGroupMessages(mockReq, mockRes);

      expect(db.group_members.findOne).toHaveBeenCalledWith({
        where: {
          group_id: 1,
          user_id: 1,
        },
      });
      expect(db.group_messages.findAll).toHaveBeenCalledWith({
        where: { group_id: 1 },
        include: [
          {
            model: db.users,
            as: 'sender',
            attributes: ['user_id', 'user_name'],
          },
        ],
        order: [['created_at', 'ASC']],
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        messages: [{ message_id: 1, message_body: 'Hello, group!', group_id: 1 }],
      });
    });

    it('should return 403 if user is not a member of the group', async () => {

      mockReq.params = { group_id: 1 };
      db.group_members.findOne.mockResolvedValue(null);
      await getGroupMessages(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'You are not a member of this group.' });
    });

    it('should return 500 on error', async () => {

      mockReq.params = { group_id: 1 };
      db.group_members.findOne.mockRejectedValue(new Error('Database error'));

      await getGroupMessages(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to retrieve messages.', error: expect.anything() });
    });
  });
});
