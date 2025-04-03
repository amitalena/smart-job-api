const mongoose = require('mongoose')
const contactUsSchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true
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
        match: [/.+@.+\..+/, 'Please enter a valid email']
    },
    contact: {
        type: String,
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    submittedAt: { type: Date, default: Date.now },
});
contactUsSchema.index({ email: 1, submittedAt: 1 });

const CONTACTUS = mongoose.model('Contactus', contactUsSchema)
module.exports = CONTACTUS;