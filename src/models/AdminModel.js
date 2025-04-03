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
    mobile: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        required: true,
        match: [/.+@.+\..+/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 1
    },
    role: {
        type: Number,
        default: 1,
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
});

const ADMIN = mongoose.model("Admin", AdminSchema);
module.exports = ADMIN;