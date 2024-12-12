const mongoose = require("mongoose");

//------------------< CANDIDATE SCHEMA >------------------//
const candidateSchema = new mongoose.Schema({
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
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid email']
    },
    mobile: {
        type: Number,
        required: true
    },
    job_function: {
        type: String,
        required: true
    },
    experience: {
        years: {
            type: Number,
            required: true,
        },
        months: {
            type: Number,
            required: true,
        }
    },
    current_location: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    key_skills: {
        type: String,
        required: true
    },
    profileImage: String,
    candidateResume: {
        type: String,
        required: true
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
}, { timestamps: true });

// Create model
const CANDIDATE = mongoose.model('Candidate', candidateSchema);
module.exports = CANDIDATE;