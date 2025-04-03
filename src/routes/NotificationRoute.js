const express = require('express');
const router = express.Router();
const { sendNotification, markAsRead, deleteNotification, updateNotification, replyByRecruiter, getNotifications, replyByApplicant } = require('../controllers/NotificationController');

// Middleware to varify token users
const validateToken = require('../middlewares/tokenHandlerMiddleware');

// **Routes for Notifications**

// 1. Send a notification
router.post('/notifications/send', validateToken, sendNotification);

// 2. Get notifications for a recruiter
router.get('/notifications/history', validateToken, getNotifications);

// 4. Reply to a notification
router.post('/notifications/reply-applicant', validateToken, replyByApplicant);

// 5. Reply to a notification
router.post('/notifications/reply-recruiter', validateToken, replyByRecruiter);


// 6. Mark a notification as read
router.patch('/notifications/:id/read', markAsRead);

// 7. Update notification
router.put("/notifications/update/:notificationId", validateToken, updateNotification);

// 8. Delete a notification
router.delete('/delete/:notificationId', validateToken, deleteNotification);

module.exports = router;