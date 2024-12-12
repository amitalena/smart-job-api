const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        default: null,
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true,
    },
    type: {
        type: String,
        enum: ['job_update', 'interview_schedule', 'feedback'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    is_read: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    replies: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
            reply_message: { type: String, required: true },
            created_at: { type: Date, default: Date.now },
        },
    ],
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;