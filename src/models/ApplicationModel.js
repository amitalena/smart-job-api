const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
        default: null
    },
    name: {
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        }
    },
    email: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    full_address: {
        type: String,
        require: true
    },
    dob: {
        type: Date,
        required: true
    },
    total_experience: {
        type: Number,
        required: true
    },
    relevant_experience: {
        type: Number,
        required: true
    },
    current_company: {
        type: String,
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobDescription',
        required: true
    },
    status: {
        type: String,
        default: 'Applied',
        enum: ['Applied', 'InterView', 'Rejected', 'Selected']
    },
    applicationDate: {
        type: Date, default: Date.now
    },
    feedback: {
        type: String, default: ''
    },
    resume: {
        type: String
    },
}, { timestamps: true });

const APPLICATION = mongoose.model("Application", applicationSchema);
module.exports = APPLICATION;
