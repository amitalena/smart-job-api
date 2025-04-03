const mongoose = require('mongoose');

const JobApplySchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Applicant',
        required: true,
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: false,
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobDescription',
        required: true
    },
    resume: {
        type: String, required: true
    },
    status: {
        type: String,
        default: 'Applied',
        enum: ['Applied', 'In Review', 'Shortlisted', 'Rejected', 'Hired'],
        required: true,
    },
    feedback: {
        type: String, default: ''
    },
    is_read: {
        type: Boolean,
        default: false
    },
    recruiterActionDate: { type: Date },
    applicationDate: {
        type: Date,
        default: Date.now,
    }

});
const JOBAPPLY = mongoose.model("Applies", JobApplySchema);
module.exports = JOBAPPLY;