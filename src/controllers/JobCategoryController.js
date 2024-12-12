const JOBCATEGORIES = require('../models/JobCategoryModel');

// Route to fetch categories with filters
exports.getJobByCategory = async (req, res) => {
    try {
        const { jobTitle, location, experienceMin, experienceMax, salaryMin, salaryMax, campany_name } = req.query;

        // Build query object dynamically
        const filter = {};

        if (jobTitle) {
            filter.job_title = { $regex: jobTitle, $options: "i" }; // Case-insensitive search
        }

        if (location) {
            filter.location = { $regex: location, $options: "i" }; // Case-insensitive search
        }

        if (campany_name) {
            filter.company_name = { $regex: campany_name, $options: "i" }; // Case-insensitive search
        }

        if (experienceMin || experienceMax) {
            filter["experience.e_min"] = { $gte: Number(experienceMin) || 0 };
            filter["experience.e_max"] = { $lte: Number(experienceMax) || Number.MAX_SAFE_INTEGER };
        }

        if (salaryMin || salaryMax) {
            filter["salary.s_min"] = { $gte: Number(salaryMin) || 0 };
            filter["salary.s_max"] = { $lte: Number(salaryMax) || Number.MAX_SAFE_INTEGER };
        }

        // Fetch jobs based on filter
        const jobs = await JOBCATEGORIES.find(filter);

        res.status(200).json({
            success: true,
            data: jobs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while filtering jobs",
            error: error.message,
        });
    }
};

// Route to create a new job category
exports.postJobByCategories = async (req, res) => {
    try {
        const { location, experience, jobTitle, salary } = req.body;

        const newCategory = new JOBCATEGORIES({
            location,
            experience,
            jobTitle,
            salary
        });

        await newCategory.save();
        res.status(201).json(newCategory);

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};