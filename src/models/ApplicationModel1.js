const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Applicant",
        default: null
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "shortlisted", "rejected"],
        default: "pending"
    },
    applicationDate: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

const APPLICATION1 = mongoose.model("Application", JobApplicationSchema);
module.exports = APPLICATION1;