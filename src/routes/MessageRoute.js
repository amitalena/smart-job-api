const express = require('express');
const { sendMessage, getChatHistory, markAsRead } = require('../controllers/MessageController');
const validateToken = require('../middlewares/tokenHandlerMiddleware');
const router = express.Router();

// Route to send a message
router.post('/messages/send', validateToken, sendMessage);

// Route to get messages between two users
router.get('/messages/history', validateToken, getChatHistory);

router.patch('/messages/:messageId/read', validateToken, markAsRead);

module.exports = router;
