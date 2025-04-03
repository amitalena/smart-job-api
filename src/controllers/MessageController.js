const { sendRealTimeMessage } = require('../middlewares/messageMiddleware');
const MESSAGE = require('../models/MessageModel');

/**
 * Send a message
 */
exports.sendMessage = async (req, res) => {
    const recruiterId = req.user.id; // Extracted from token
    const { applicantId, message } = req.body;

    // Validate request
    if (!applicantId || !message) {
        return res.status(400).json({
            success: false,
            error: 'Applicant ID and content are required',
        });
    }

    try {
        // Save message in the database
        const newMessage = await MESSAGE.create({
            recruiterId,
            applicantId,
            message,
        });

        // Send real-time message
        sendRealTimeMessage({
            recruiterId,
            applicantId,
            message,
        });

        return res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage,
        });
    } catch (err) {
        console.error('Error sending message:', err.message);
        res.status(500).json({ success: false, error: 'Error sending message' });
    }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
    const { recruiterId, applicantId } = req.body;

    if (!recruiterId || !applicantId) {
        return res.status(400).json({ success: false, error: 'Both recruiterId and applicantId are required' });
    }

    try {
        const messages = await MESSAGE.find({
            $or: [
                { recruiterId, applicantId },
                { recruiterId: applicantId, applicantId: recruiterId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching chat history:', error.message);
        res.status(500).json({ success: false, error: 'Error fetching chat history' });
    }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    const { recruiterId, applicantId } = req.body;

    try {
        await MESSAGE.updateMany(
            { recruiterId, applicantId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error.message);
        res.status(500).json({ success: false, error: 'Error marking messages as read' });
    }
};

/**
 * Update a message
 */
exports.updateMessage = async (req, res) => {
    const recruiterId = req.user.id; // Extracted from token
    const { messageId, updatedContent } = req.body;

    if (!messageId || !updatedContent) {
        return res.status(400).json({
            success: false,
            error: 'Message ID and updated content are required',
        });
    }

    try {
        const message = await MESSAGE.findOneAndUpdate(
            { _id: messageId, senderId: recruiterId }, // Only allow sender to update
            { content: updatedContent },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found or not authorized' });
        }

        return res.status(200).json({
            success: true,
            message: 'Message updated successfully',
            data: message,
        });
    } catch (err) {
        console.error('Error updating message:', err.message);
        res.status(500).json({ success: false, error: 'Error updating message' });
    }
};

/**
 * Delete a message
 */
exports.deleteMessage = async (req, res) => {
    const recruiterId = req.user.id; // Extracted from token
    const { messageId } = req.body;

    if (!messageId) {
        return res.status(400).json({
            success: false,
            error: 'Message ID is required',
        });
    }

    try {
        const message = await MESSAGE.findOneAndDelete({
            _id: messageId,
            senderId: recruiterId, // Only allow sender to delete
        });

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found or not authorized' });
        }

        return res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting message:', err.message);
        res.status(500).json({ success: false, error: 'Error deleting message' });
    }
};

