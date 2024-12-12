const mongoose = require("mongoose")

//------------------< RECRUITER SCHEMA >------------------// 
const RecruiterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null
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
    },
    mobile: {
        type: Number,
        require: true,
    },
    role: {
        type: Number,
        default: 2,
        // require: true
    },
    status: {
        type: Number,
        default: 1,
        // require: true
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
    description: String,
    profileImage: String,
}, { timestamps: true })

const RECRUITER = mongoose.model('Recruiter', RecruiterSchema);
module.exports = RECRUITER;