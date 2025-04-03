const mongoose = require("mongoose")

//------------------< RECRUITER SCHEMA >------------------// 
const RecruiterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null
    },
    user_name: {
        type: String,
        require: true
    },
    name: {
        first_name: {
            type: String,
            require: true
        },
        last_name: {
            type: String,
            require: true,
        }
    },
    gender: {
        type: String,
        require: true
    },
    job_function: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        match: [/.+@.+\..+/, 'Please enter a valid email']
    },
    mobile: {
        type: String,
        require: true,
    },
    role: {
        type: Number,
        default: 2,
    },
    status: {
        type: Number,
        default: 1,
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
    education: {
        type: String,
        require: true
    },
    skills: {
        type: String,
        require: true
    },
    current_location: {
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
    password: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    description: { type: String, default: null },
    profileImage: { type: String, default: null }
})

const RECRUITER = mongoose.model('Recruiter', RecruiterSchema);
module.exports = RECRUITER;