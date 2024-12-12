const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "recruiter",
        default: null
    },
    name: {
        type: String,
        required: true
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
}, { timestamps: true });

const APPLICATION = mongoose.model("Application", JobApplicationSchema);
module.exports = APPLICATION;