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
    email: {
        type: String,
        require: true
    },
    mobile: {
        type: Number,
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
    description: String,
    employeeImage: {
        type: String,
        require: true
    },
}, { timestamps: true })

const EMPLOYEE = mongoose.model('Employee', emplopyeeSchema);
module.exports = EMPLOYEE;