const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    data: [{
        key: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        }
    }]
});
const RESUME = mongoose.model('Resume', ResumeSchema);

module.exports = RESUME;