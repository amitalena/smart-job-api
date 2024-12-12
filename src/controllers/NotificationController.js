const Notification = require('../models/NotificationModel');
const { sendRealTimeNotification } = require('../middlewares/notificationMiddleware');

// **Send a Notification**
const sendNotification = async (req, res) => {
    try {
        const { recipient_id, type, message } = req.body;
        const recruiterId = req.user?.id;

        if (!recipient_id || !type || !message) {
            return res.status(400).json({ error: 'Recipient ID, type, and message are required' });
        }

        const notification = await Notification.create({
            userId: recruiterId,
            candidateId: recipient_id,
            type,
            message,
        });

        if (sendRealTimeNotification) {
            sendRealTimeNotification(recipient_id, {
                type,
                message,
                created_at: notification.created_at,
            });
        }

        return res.status(201).json({
            message: 'Notification sent successfully',
            notification,
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        return res.status(500).json({
            error: 'Failed to send notification',
            details: error.message,
        });
    }
};

// Get notifications by userId (recruiter)
const getNotificationsByRecruiter = async (req, res) => {
    try {
        const userId = req.user?.id;  // Assuming user is authenticated and their ID is in req.user

        if (!userId) {
            return res.status(400).json({ error: 'User not authenticated' });
        }

        // Fetch notifications where the user is either the recruiter (userId) or the candidate (candidateId)
        const notifications = await Notification.find({
            $or: [
                { userId },               // Notifications where the recruiter is the user
                { candidateId: userId },   // Notifications where the candidate is the user
            ],
        }).sort({ created_at: -1 });  // Sorting by creation date in descending order (most recent first)

        return res.status(200).json({
            message: 'Notifications retrieved successfully',
            notifications,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({
            error: 'Failed to fetch notifications',
            details: error.message,
        });
    }
};

// **Get Notifications for a Candidate**
const getNotificationsByCandidate = async (req, res) => {
    try {
        const userId = req.user?.id;  // Assuming user is authenticated and their ID is in req.user

        if (!userId) {
            return res.status(400).json({ error: 'User not authenticated' });
        }

        // Fetch notifications where the user is either the recruiter (userId) or the candidate (candidateId)
        const notifications = await Notification.find({
            $or: [
                { userId },               // Notifications where the recruiter is the user
                { candidateId: userId },   // Notifications where the candidate is the user
            ],
        }).sort({ created_at: -1 });  // Sorting by creation date in descending order (most recent first)

        return res.status(200).json({
            message: 'Notifications retrieved successfully',
            notifications,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({
            error: 'Failed to fetch notifications',
            details: error.message,
        });
    }
};

//  reccruiter conversession bteween candidate
const replyByRecruiter = async (req, res) => {
    try {
        const { notificationId, reply_message } = req.body;
        const recruiterId = req.user?.id; // Assuming recruiter's ID is extracted from authentication middleware

        // Validate input
        if (!notificationId || !reply_message) {
            return res.status(400).json({ success: false, message: 'Notification ID and reply message are required' });
        }

        if (!recruiterId) {
            return res.status(401).json({ success: false, message: 'Unauthorized access' });
        }

        // Find the notification and add the reply
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            {
                $push: {
                    replies: {
                        userId: recruiterId,
                        reply_message,
                        created_at: new Date(),
                    },
                },
            },
            { new: true } // Return the updated document
        );

        // If notification not found
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Optionally, trigger a real-time notification for the candidate
        if (sendRealTimeNotification) {
            sendRealTimeNotification(notification.candidateId, {
                type: 'reply',
                message: reply_message,
                created_at: new Date(),
            });
        }

        // Response on success
        return res.status(200).json({
            success: true,
            message: 'Reply added successfully',
            data: notification,
        });
    } catch (error) {
        console.error('Error adding reply:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add reply',
            error: error.message,
        });
    }
};

// **Reply to a Notification**
const replyByCandidate = async (req, res) => {
    try {
        const { notificationId, reply_message } = req.body;
        const candidateId = req.user?.id; // Ensure the candidate's ID is obtained from the token

        if (!notificationId || !reply_message) {
            return res.status(400).json({ success: false, message: 'Notification ID and reply message are required' });
        }

        // Find the notification to ensure it exists and get the recruiter ID (userId)
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Add the candidate's reply to the notification's replies array
        notification.replies.push({
            userId: candidateId, // Candidate replying
            reply_message,
            created_at: new Date(),
        });

        // Save the updated notification
        await notification.save();

        // Send real-time notification if recruiter is connected
        const socketId = connectedUsers.get(notification.userId.toString()); // Recruiter ID from the notification

        if (socketId && sendRealTimeNotification) {
            sendRealTimeNotification(socketId, {
                type: 'candidate_reply',
                message: reply_message,
                notificationId: notification._id,
                created_at: new Date(),
            });
        } else {
            console.log(`Recruiter with ID ${notification.userId} is not connected. Reply saved.`);
        }

        return res.status(200).json({
            success: true,
            message: 'Reply added successfully. Recruiter will be notified if online.',
            data: notification,
        });
    } catch (error) {
        console.error('Error adding reply:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add reply',
            error: error.message,
        });
    }
};

// **Mark a Notification as Read**
const markAsRead = async (req, res) => {
    const { notification_id } = req.params;

    if (!notification_id) {
        return res.status(400).json({ message: 'Notification ID is required' });
    }

    try {
        const updatedNotification = await Notification.findByIdAndUpdate(
            notification_id,
            { is_read: true },
            { new: true, runValidators: true }
        );

        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({
            message: 'Notification marked as read',
            notification: updatedNotification,
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({
            message: 'Failed to mark notification as read',
            error: error.message,
        });
    }
};

// **Update notifications **
const updateNotification = async (req, res) => {
    try {
        const { notificationId } = req.params; // Notification ID from URL
        const { type, message, reply_message } = req.body;
        const userId = req.user?.id; // Assuming the user ID is extracted from authentication middleware

        // Find the notification by ID
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found", Status: false });
        }

        // Update fields if provided
        if (type) notification.type = type;
        if (message) notification.message = message;
        // Add a reply if `reply_message` is provided
        if (reply_message) {
            if (!userId) {
                return res.status(400).json({ message: "User ID is required for replies", Status: false });
            }

            notification.replies.push({
                userId,
                reply_message,
            });
        }

        // Save the updated notification
        const updatedNotification = await notification.save();

        // Success response
        return res.status(200).json({
            message: "Notification updated successfully!",
            Status: true,
            data: updatedNotification,
        });
    } catch (error) {
        console.error("Error in updating notification:", error.message);
        return res.status(500).json({ message: "Internal Server Error", Status: false });
    }
};

// **Delete a Notification**
const deleteNotification = async (req, res) => {
    const { notification_id } = req.params;

    try {
        const deletedNotification = await Notification.findByIdAndDelete(notification_id);

        if (!deletedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({
            message: 'Notification deleted successfully',
            notification: deletedNotification,
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({
            message: 'Failed to delete notification',
            error: error.message,
        });
    }
};

module.exports = {
    sendNotification,
    getNotificationsByRecruiter,
    getNotificationsByCandidate,
    replyByRecruiter,
    replyByCandidate,
    updateNotification,
    markAsRead,
    deleteNotification,
};