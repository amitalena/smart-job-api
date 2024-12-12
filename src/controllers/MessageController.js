const Message = require('../models/MessageModel');

const sendMessage = async (req, res) => {
    const from = req.user.id; // Extracted from token
    const { to, content } = req.body;

    if (!to || !content) {
        return res.status(400).json({ error: 'Recipient ID and content are required' });
    }

    try {
        const message = new Message({ from, to, content });
        await message.save();

        // Emit real-time message via Socket.IO using the `req.io` instance
        if (req.io) {
            req.io.emit('receive-message', message);
        } else {
            console.error('Socket.IO instance not found on req object.');
        }

        res.status(200).json({ success: true, message });
    } catch (err) {
        console.error('Error sending message:', err.message);
        res.status(500).json({ error: 'Error sending message' });
    }
};

const getMessages = async (req, res) => {
    const userId = req.user.id; // Extracted from token

    try {
        // Fetch all messages where the authenticated user is the sender or recipient
        const messages = await Message.find({
            $or: [{ from: userId }, { to: userId }],
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching messages:', error.message);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
// Update a message
const updateMessage = async (req, res) => {
    const userId = req.user.id; // Extracted from token
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required to update the message' });
    }

    try {
        // Find the message and verify the sender
        const message = await Message.findOne({ _id: messageId, from: userId });

        if (!message) {
            return res.status(404).json({ error: 'Message not found or you are not authorized to update it' });
        }

        // Update the message content
        message.content = content;
        await message.save();

        res.status(200).json({ success: true, message });
    } catch (err) {
        console.error('Error updating message:', err.message);
        res.status(500).json({ error: 'Error updating message' });
    }
};

// Delete a message
const deleteMessage = async (req, res) => {
    const userId = req.user.id; // Extracted from token
    const { messageId } = req.params;

    try {
        // Find the message and verify the sender
        const message = await Message.findOneAndDelete({ _id: messageId, from: userId });

        if (!message) {
            return res.status(404).json({ error: 'Message not found or you are not authorized to delete it' });
        }

        try {
            // Emit real-time delete notification via Socket.IO
            req.io.emit('delete-message', { messageId });
        } catch (emitError) {
            // Log the emit error but don't send it to the client since the delete succeeded
            console.error('Socket.IO emit error:', emitError.message);
        }

        // Respond to the client after successful deletion
        return res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (err) {
        console.error('Error deleting message:', err.message);
        return res.status(500).json({ error: 'Error deleting message' });
    }
};


// const getMessages = async (req, res) => {
//     const from = req.user.id; // Extracted from token
//     const { to } = req.params;

//     if (!to) {
//         return res.status(400).json({ error: 'Recipient ID is required' });
//     }

//     try {
//         const messages = await Message.find({
//             $or: [
//                 { from, to },
//                 { from: to, to: from },
//             ],
//         }).sort({ createdAt: 1 });

//         res.status(200).json({ success: true, data: messages });
//     } catch (error) {
//         console.error('Error fetching messages:', error.message);
//         res.status(500).json({ error: 'Failed to fetch messages' });
//     }
// };


module.exports = { sendMessage, getMessages, updateMessage, deleteMessage };