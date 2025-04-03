// models/MessageModel.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, },
    updatedAt: { type: Date, default: Date.now, },
});

const MESSAGE = mongoose.model('Message', messageSchema);

module.exports = MESSAGE;