const mongoose = require('mongoose')
const contactUsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
},
    {
        Timestamp: true
    }
)


const CONTACTUS = mongoose.model('Contactus', contactUsSchema)
module.exports = CONTACTUS;