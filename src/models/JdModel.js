const mongoose = require("mongoose")

//------------------< RECRUITER SCHEMA >------------------// 
const JobDescriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null
    },
    job_title: {
        type: String,
        required: true
    },
    job_id: {
        type: String,
        required: true
    },
    start_date: {
        type: String,
        required: true
    },
    close_date: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: true
    },
    company_name: {
        type: String,
        required: true
    },
    job_function: {
        type: String,
        required: true
    },
    key_skills: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    experience: {
        e_min: {
            type: Number,
            required: true
        },
        e_max: {
            type: Number,
            required: true
        }
    },
    salary: {
        s_min: {
            type: Number,
            required: true
        },
        s_max: {
            type: Number,
            required: true
        }
    },
    job_description: {
        type: String,
        required: true
    }
}, { timestamps: true });

const JOBDESCRIPTION = mongoose.model('JobDescription', JobDescriptionSchema);
module.exports = JOBDESCRIPTION;