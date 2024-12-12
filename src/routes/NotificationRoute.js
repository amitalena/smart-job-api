const express = require('express');
const router = express.Router();
const { sendNotification, getNotificationsByRecruiter, getNotificationsByCandidate, markAsRead, deleteNotification, updateNotification, replyByCandidate, replyByRecruiter } = require('../controllers/NotificationController');

// Middleware to varify token users
const validateToken = require('../middlewares/tokenHandlerMiddleware');

// **Routes for Notifications**

// 1. Send a notification
router.post('/notifications/send', validateToken, sendNotification);

// 2. Get notifications for a recruiter
router.get('/notifications/by-recruiter', validateToken, getNotificationsByRecruiter);

// 3. Get notifications for a candidate
router.get('/notifications/by-candidate', validateToken, getNotificationsByCandidate);

// 4. Reply to a notification
router.post('/notifications/reply-candidate', validateToken, replyByCandidate);

// 5. Reply to a notification
router.post('/notifications/reply-recruiter', validateToken, replyByRecruiter);


// 6. Mark a notification as read
router.patch('/notifications/read/:notification_id', markAsRead);

// 7. Update notification
router.put("/notifications/update/:notificationId", validateToken, updateNotification);

// 8. Delete a notification
router.delete('/delete/:notification_id', validateToken, deleteNotification);

module.exports = router;