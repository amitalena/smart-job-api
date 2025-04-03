const mongoose = require('mongoose');

const ApplicantSchema = new mongoose.Schema({
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
        type: String,
        require: true,
    },
    dob: {
        type: Date,
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
    mobile: {
        type: String,
        require: true
    },
    skills: {
        type: String,
        require: true
    },
    address: {
        pin_code: {
            type: Number,
            require: true,
        },
        locality: {
            type: String,
            require: true,
        },
        city: {
            type: String,
            require: true,
        },
        state: {
            type: String,
            require: true,
        },
    },

    experience: {
        years: {
            type: Number,
            require: true,
        },
        months: {
            type: Number,
            require: true,
        }
    },
    current_company: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    description: { type: String, default: null },
    profileImage: { type: String },
    resume: { type: String },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const APPLICANT = mongoose.model("Applicant", ApplicantSchema);
module.exports = APPLICANT;