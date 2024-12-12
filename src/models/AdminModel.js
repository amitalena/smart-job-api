const mongoose = require("mongoose")

//------------------< ADMIN SCHEMA >------------------//
const AdminSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true
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
    password: {
        type: String,
        required: true
    },
    confirm_password: String,
    mobile: {
        type: Number,
        required: true
    },
    role: {
        type: Number,
        default: 1,
        require: true
    },
    description: String,
    profileImage: String
}, { timestamps: true })

const ADMIN = mongoose.model("Admin", AdminSchema);
module.exports = ADMIN;