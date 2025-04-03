const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        default: null,
    },
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Applicant',
        required: true,
    },
    type: {
        type: String,
        enum: ['Job_update', 'Interview_schedule', 'Feedback'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    replies: [
        {
            applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
            replyMessage: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;