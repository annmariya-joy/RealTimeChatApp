const express = require('express');
const { sendMessage, getMessages,sendGroupMessage,getGroupMessages } = require('../controllers/messageController');
const { authenticateAccessToken } = require('../config/utils/auth');

module.exports = (io) => {
    const router = express.Router();

    router.post('/sendMessage', authenticateAccessToken, sendMessage(io));  
    router.get('/received/:user_id', authenticateAccessToken, getMessages);
    router.post('/sendGroupMessage', authenticateAccessToken, sendGroupMessage(io)); 
    router.get('/:group_id/messages', authenticateAccessToken, getGroupMessages);
    return router;
};
