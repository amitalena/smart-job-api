const JOBCATEGORIES = require('../models/JobCategoryModel');

// Create job categories
exports.createJobCategory = async (req, res) => {
    try {
        const { job_name, description } = req.body;

        // Validate required fields
        if (!job_name) {
            return res.status(400).json({ message: 'Job name is required', status: false, data: null, });
        }

        // Check for duplicate job name
        const existingJobName = await JOBCATEGORIES.findOne({ job_name });
        if (existingJobName) {
            return res.status(400).json({ message: 'Job name is already registered', status: false, data: null, });
        }

        // Create and save the new job category
        const category = await JOBCATEGORIES.create({ job_name, description });

        return res.status(201).json({ message: 'Job Category created successfully', status: true, data: category, });
    } catch (error) {
        console.error('Error creating job category:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Category already exists', status: false, data: null, });
        }

        // General error handler
        return res.status(500).json({ message: 'Internal server error', status: false, data: null, });
    }
};

// Get all job categories
exports.getJobCategories = async (req, res) => {
    try {
        const categories = await JOBCATEGORIES.find().sort({ job_name: 1 });
        res.status(200).json({ message: 'Job Categories fetched successfully', status: true, data: categories, });
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        res.status(500).json({ message: 'Internal server error', status: false, data: null, });
    }
};

// Update job categories
exports.updateJobCategory = async (req, res) => {
    const { id } = req.params;
    const { job_name, description } = req.body;

    try {
        const category = await JOBCATEGORIES.findByIdAndUpdate(id, { job_name, description }, { new: true, runValidators: true });

        if (!category) {
            return res.status(404).json({ message: 'Category not found', status: false, data: null, });
        }

        res.status(200).json({ message: 'Job Category updated successfully', status: true, data: category, });
    } catch (error) {
        console.error('Error updating category:', error.message);
        res.status(500).json({ message: 'Internal server error', status: false, data: null, });
    }
};

// Delete job categories
exports.deleteJobCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await JOBCATEGORIES.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                message: 'Category not found',
                status: false,
                data: null,
            });
        }

        res.status(200).json({
            message: 'Job Category deleted successfully',
            status: true,
            data: category,
        });
    } catch (error) {
        console.error('Error deleting category:', error.message);
        res.status(500).json({
            message: 'Internal server error',
            status: false,
            data: null,
        });
    }
};

// Search category
exports.searchJobCategory = async (req, res) => {
    try {
        // Get the search query and optional pagination parameters from the request
        const { query = "" } = req.query;

        // Build a search filter for the fields (e.g., `name`)
        const searchFilter = query
            ? {
                $or: [
                    { job_name: { $regex: query, $options: "i" } }, // Case-insensitive search for `name`
                ],
            }
            : {};

        // Fetch the search results with pagination
        const results = await JOBCATEGORIES.find(searchFilter)

        // Send the response
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        // Handle server errors
        res.status(500).json({ success: false, message: "An error occurred while fetching media.", error: error.message, });
    }
};