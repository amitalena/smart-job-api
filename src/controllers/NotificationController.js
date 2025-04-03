const Notification = require('../models/NotificationModel');
const { sendRealTimeNotification } = require('../middlewares/notificationMiddleware');

// **Send a Notification**
const sendNotification = async (req, res) => {
    try {
        const { applicantId, type, message } = req.body;
        const recruiterId = req.user?.id;

        if (!applicantId || !type || !message) {
            return res.status(400).json({ error: 'Recipient ID, type, and message are required' });
        }

        const notification = await Notification.create({
            recruiterId: recruiterId,
            applicantId: applicantId,
            type,
            message,
        });

        if (sendRealTimeNotification) {
            sendRealTimeNotification(applicantId, {
                type,
                message,
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
const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;  // Assuming user is authenticated and their ID is in req.user

        if (!userId) {
            return res.status(400).json({ error: 'User not authenticated' });
        }

        // Fetch notifications where the user is either the recruiter (userId) or the candidate (applicantId)
        const notifications = await Notification.find({
            $or: [
                { recruiterId: userId },               // Notifications where the recruiter is the user
                { applicantId: userId },   // Notifications where the candidate is the user
            ],
        }).sort({ createdAt: -1 });  // Sorting by creation date in descending order (most recent first)

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
        const { notificationId, replyMessage } = req.body;
        const recruiterId = req.user?.id; // Assuming recruiter ID is extracted from authentication middleware

        // Validate input
        if (!notificationId || !replyMessage) {
            return res.status(400).json({ success: false, message: 'Notification ID and reply message are required' });
        }

        if (!recruiterId) {
            return res.status(401).json({ success: false, message: 'Unauthorized access' });
        }

        // Find and update notification with recruiter reply
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            {
                $push: {
                    replies: {
                        applicantId: recruiterId, // Store recruiter ID in applicantId field to track replies
                        replyMessage,
                        createdAt: new Date(),
                    },
                },
            },
            { new: true } // Return updated document
        ).populate('replies.applicantId', 'name email'); // Populate reply author details

        // Check if notification exists
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        // Optionally, trigger a real-time notification for the candidate
        if (sendRealTimeNotification) {
            sendRealTimeNotification(notification.applicantId, {
                type: 'reply',
                message: replyMessage,
                createdAt: new Date(),
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Recruiter reply added successfully',
            data: notification,
        });
    } catch (error) {
        console.error('Error adding recruiter reply:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add recruiter reply',
            error: error.message,
        });
    }
};

// **Reply to a Notification**
const replyByApplicant = async (req, res) => {
    try {
        const { notificationId, replyMessage } = req.body;
        const applicantId = req.user?.id; // Assuming applicant ID is extracted from middleware

        // Validate required fields
        if (!notificationId || !replyMessage) {
            return res.status(400).json({
                success: false,
                message: "Notification ID and reply message are required",
            });
        }

        if (!applicantId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        // Update the notification with the applicant's reply
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            {
                $push: {
                    replies: {
                        applicantId,
                        replyMessage,
                        createdAt: new Date(),
                    },
                },
            },
            { new: true } // Return the updated notification
        ).populate("replies.applicantId", "name email"); // Populate applicant details in replies

        // Check if notification exists
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        // Optionally, trigger a real-time notification for the candidate
        if (sendRealTimeNotification) {
            sendRealTimeNotification(notification.applicantId, {
                type: 'reply',
                message: replyMessage,
                createdAt: new Date(),
            });
        }

        // Respond with success
        return res.status(200).json({
            success: true,
            message: "Applicant reply added successfully",
            data: notification,
        });
    } catch (error) {
        console.error("Error adding applicant reply:", error.message);

        // General error response
        return res.status(500).json({
            success: false,
            message: "Failed to add applicant reply",
            error: error.message,
        });
    }
};


// **Mark a Notification as Read**
const markAsRead = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Notification ID is required' });
    }

    try {
        const updatedNotification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
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
        const { type, message, replyMessage } = req.body;
        const userId = req.user?.id; // Assuming the user ID is extracted from authentication middleware

        // Find the notification by ID
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found", Status: false });
        }

        // Update fields if provided
        if (type) notification.type = type;
        if (message) notification.message = message;
        // Add a reply if `replyMessage` is provided
        if (replyMessage) {
            if (!userId) {
                return res.status(400).json({ message: "User ID is required for replies", Status: false });
            }

            notification.replies.push({
                userId,
                replyMessage,
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
    getNotifications,
    replyByRecruiter,
    replyByApplicant,
    updateNotification,
    markAsRead,
    deleteNotification,
};