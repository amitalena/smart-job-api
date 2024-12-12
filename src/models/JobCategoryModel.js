const mongoose = require('mongoose');

const jobCategorySchema = new mongoose.Schema({
    experience: {
        e_min: Number,
        e_max: Number,
    },
    salary: {
        s_min: Number,
        s_max: Number,
    },
    job_title: String,
    location: String,
    company_name: String,
    createdAt: Date,
    updatedAt: Date,
});

const JOBCATEGORIES = mongoose.model('JobCategory', jobCategorySchema);
module.exports = JOBCATEGORIES;