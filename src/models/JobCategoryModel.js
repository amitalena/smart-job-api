const mongoose = require('mongoose');

const jobCategorySchema = new mongoose.Schema({
    job_name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
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

const JOBCATEGORIES = mongoose.model('JobCategory', jobCategorySchema);
module.exports = JOBCATEGORIES;