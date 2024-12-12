const express = require('express');
const { sendMessage, getMessages, updateMessage, deleteMessage } = require('../controllers/MessageController');
const validateToken = require('../middlewares/tokenHandlerMiddleware');
const router = express.Router();

// Route to send a message
router.post('/send', validateToken, sendMessage);

// Update a message
router.put('/update/:messageId', validateToken, updateMessage);

// Delete a message
router.delete('/delete/:messageId', validateToken, deleteMessage);

// Route to get messages between two users
router.get('/all-messages', validateToken, getMessages);

module.exports = router;