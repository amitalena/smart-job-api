const APPLICATION = require('../models/ApplicationModel');

exports.createApplication = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User not authenticated" });
        }
        const { name, email, designation, contact, address, full_address, dob, gender, total_experience, relevant_experience, current_company } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !designation || !contact || !address || !dob || !gender || !total_experience || !relevant_experience || !current_company) {
            return res.status(400).json({ message: "All fields are mandatory", Status: false });
        }

        // Check if the email is already registered
        const existingApplicant = await APPLICATION.findOne({ email });
        if (existingApplicant) {
            return res.status(400).json({ message: "Email is already registered", Status: false });
        }

        // Create the new application
        const newApplication = await APPLICATION.create({ userId: userId, name, email, designation, contact, address, full_address, dob, gender, total_experience, relevant_experience, current_company });

        // Respond with success
        return res.status(200).json({ message: "Application created successfully", Status: true, data: newApplication });

    } catch (error) {
        console.error("Error creating application:", error);
        return res.status(500).json({ message: "Internal server error", Status: false, error: error.message });
    }
};

// get All Applicant by recruiterId
exports.getApplicationsByUserId = async (req, res) => {
    const userAppId = req.user?.id;
    console.log("applicant id", userAppId)
    try {
        // Find applications by id
        const applications = await APPLICATION.find({ userAppId });
        if (!applications.length === 0) {
            return res.status(404).json({
                message: "No applications found for this user",
                Status: false
            });
        }
        return res.status(200).json({
            message: "Applications fetched successfully",
            Status: true,
            data: applications
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        return res.status(500).json({
            message: "Internal server error",
            Status: false,
            error: error.message
        });
    }
};

// Get all applications
exports.getAllApplications = async (req, res) => {
    try {
        const applications = await APPLICATION.find({});
        return res.status(200).json({
            message: "Applications fetched successfully",
            Status: true,
            data: applications
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        return res.status(500).json({
            message: "Internal server error",
            Status: false,
            error: error.message
        });
    }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
    const { id } = req.params;
    try {
        const application = await APPLICATION.findById(id);
        if (!application) {
            return res.status(404).json({ message: "Application not found", Status: false });
        }

        return res.status(200).json({
            message: "Application fetched successfully",
            Status: true,
            data: application
        });
    } catch (error) {
        console.error("Error fetching application:", error);
        return res.status(500).json({
            message: "Internal server error",
            Status: false,
            error: error.message
        });
    }
};

// Update application
exports.updateApplication = async (req, res) => {
    const { id } = req.params;
    // const userId = req.user?.id;
    // if (!userId) {
    //     return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    // }
    try {
        const updatedApplication = await APPLICATION.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedApplication) {
            return res.status(404).json({ message: "Application not found", Status: false });
        }

        return res.status(200).json({
            message: "Application updated successfully",
            Status: true,
            data: updatedApplication
        });
    } catch (error) {
        console.error("Error updating application:", error);
        return res.status(500).json({
            message: "Internal server error",
            Status: false,
            error: error.message
        });
    }
};

// Delete application
exports.deleteApplication = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedApplication = await APPLICATION.findByIdAndDelete(id);
        if (!deletedApplication) {
            return res.status(404).json({ message: "Application not found", Status: false });
        }

        return res.status(200).json({
            message: "Application deleted successfully",
            Status: true,
        });
    } catch (error) {
        console.error("Error deleting application:", error);
        return res.status(500).json({
            message: "Internal server error",
            Status: false,
            error: error.message
        });
    }
};