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
    gender: {
        type: "string",
        require: true
    },
    email: {
        type: String,
        required: true,
        match: [/.+@.+\..+/, 'Please enter a valid email']
    },
    mobile: {
        type: String,
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
    profileImage: {
        type: String
    },
    resume: {
        type: String,
        required: true
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Create model
const CANDIDATE = mongoose.model('Candidate', candidateSchema);
module.exports = CANDIDATE;