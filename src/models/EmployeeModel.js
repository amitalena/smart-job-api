const mongoose = require("mongoose")
//------------------< EMPLOYEE SCHEMA >------------------// 
const emplopyeeSchema = new mongoose.Schema({
    name: {
        first_name: {
            type: String,
            require: true
        },
        last_name: {
            type: String,
            require: true
        }
    },
    gender: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        match: [/.+@.+\..+/, 'Please enter a valid email']
    },
    mobile: {
        type: String,
        require: true
    },
    job_function: {
        type: String,
        require: true
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
    current_location: {
        type: String,
        require: true
    },
    key_skills: {
        type: String,
        require: true
    },
    description: {
        type: String
    },
    profileImage: {
        type: String,
        require: true
    },
    resume: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const EMPLOYEE = mongoose.model('Employee', emplopyeeSchema);
module.exports = EMPLOYEE;