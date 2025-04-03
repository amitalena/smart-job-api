const config = require('../../config');
const transporter = require('../../CONFIG/emailConfig');
const JOBDESCRIPTION = require('../models/JdModel');
const RECRUITER = require('../models/RecruiterModel');

//------------------< CREATE JD >------------------//
const sendEmailToRecruiters = async (recruiters, jobDetails, adminDetails) => {
    const emailPromises = recruiters.map((recruiter) => {
        const emailHTML = `
            <div style="font-size: 11px; background-color: #fdfdfd; padding: 15px; border-radius: 10px; max-width: 600px; font-family: Arial, sans-serif;">
                <h4 style="color:rgba(18, 110, 239, 0.91); font-weight: bold; margin-bottom: 16px;">
                    Subject: <span style="font-size:12px;">Exciting Job Opportunity: ${jobDetails.job_title} at ${jobDetails.company_name}</span>
                </h4>
                <p>Dear ${recruiter.email || "Recruiter"},</p>
                <p style="margin-bottom: 16px;">
                    I hope this message finds you well. I am excited to share an incredible job opportunity that could be a great fit for your network.
                </p>
                <p style="font-weight: bold; margin-bottom: 8px;">
                    Here are the key details about the role:
                </p>
                <div style="margin-bottom: 16px;">
                    <p><strong>Job Title:</strong> ${jobDetails.job_title}</p>
                    <p><strong>Company:</strong> ${jobDetails.company_name}</p>
                    <p><strong>Qualification:</strong> ${jobDetails.qualification}</p>
                    <p><strong>Job Function:</strong> ${jobDetails.job_function}</p>
                    <p><strong>Salary:</strong> ₹${jobDetails.salary.s_min || "N/A"} - ₹${jobDetails.salary.s_max || "N/A"}</p>
                </div>
                <p style="margin-bottom: 16px;">
                    If you are interested in exploring this opportunity further, please reply to this email or contact
                    us at ${adminDetails.mobile}. Feel free to share this information with anyone who might be interested.
                </p>
                <p>Looking forward to hearing from you!</p>
                <p><strong>Best regards,</strong></p>
                <p style="font-size:12px;">
                    ${adminDetails?.user_name}<br />
                    Mobile: ${adminDetails.mobile}<br />
                    Email: ${adminDetails.email}
                </p>
            </div>
        `;

        return transporter.sendMail({
            from: config.EMAIL_FROM,
            to: recruiter.email,
            subject: `Exciting Job Opportunity: ${jobDetails.job_title} at ${jobDetails.company_name}`,
            html: emailHTML,
        });
    });

    return Promise.allSettled(emailPromises);
};

exports.createJobDescription = async (req, res) => {
    const adminDetails = {
        id: req.user?.id,
        user_name: req.user?.user_name,
        email: req.user?.email,
        mobile: req.user?.mobile
    };

    try {
        const {
            category, job_title, job_id, start_date, close_date,
            location, position, company_name, job_function, key_skills,
            qualification, experience, salary, job_description
        } = req.body;

        // Validation
        if (!job_title || !job_id || !start_date || !close_date || !location ||
            !position || !company_name || !job_function || !key_skills ||
            !qualification || !experience || !salary || !job_description) {
            return res.status(400).json({
                message: "All fields are required",
                status: false,
                data: null,
            });
        }

        // Create a new job description
        const newJobDescription = new JOBDESCRIPTION({
            userId: adminDetails.id,
            category,
            job_title,
            job_id,
            start_date,
            close_date,
            location,
            position,
            company_name,
            job_function,
            key_skills,
            qualification,
            experience,
            salary,
            job_description,
        });

        await newJobDescription.save();

        // Fetch all recruiters
        const recruiters = await RECRUITER.find({}, "email");

        if (recruiters.length > 0) {
            await sendEmailToRecruiters(recruiters, req.body, adminDetails);
        }

        res.status(201).json({
            message: "Job Description created successfully and emails sent to recruiters",
            status: true,
            data: newJobDescription,
        });
    } catch (error) {
        console.error("Error creating job description:", error.message);
        res.status(500).json({
            message: "Internal server error",
            status: false,
            data: null,
        });
    }
};

//------------------< GgET AJJ JOBS >------------------//
exports.getAllJobDescriptions = async (req, res) => {
    try {
        const jobDescriptions = await JOBDESCRIPTION.find().populate("category", "job_name").sort({ createdAt: -1 });
        res.status(200).json({
            message: "Job Descriptions fetched successfully",
            status: true,
            data: jobDescriptions,
        });
    } catch (error) {
        console.error("Error fetching job descriptions:", error.message);
        res.status(500).json({
            message: "Internal server error",
            status: false,
            data: null,
        });
    }
};

//------------------< GET JOB BY ID >------------------//
exports.getJobDescriptionById = async (req, res) => {
    try {
        const { id } = req.params;

        const jobDescription = await JOBDESCRIPTION.findById(id).populate("userId category");

        if (!jobDescription) {
            return res.status(404).json({
                message: "Job Description not found",
                status: false,
                data: null,
            });
        }

        res.status(200).json({
            message: "Job Description fetched successfully",
            status: true,
            data: jobDescription,
        });
    } catch (error) {
        console.error("Error fetching job description by ID:", error.message);
        res.status(500).json({
            message: "Internal server error",
            status: false,
            data: null,
        });
    }
};

//------------------< UPDATE JOB >------------------//
exports.updateJobDescription = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedJobDescription = await JOBDESCRIPTION.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!updatedJobDescription) {
            return res.status(404).json({
                message: "Job Description not found",
                status: false,
                data: null,
            });
        }

        res.status(200).json({
            message: "Job Description updated successfully",
            status: true,
            data: updatedJobDescription,
        });
    } catch (error) {
        console.error("Error updating job description:", error.message);
        res.status(500).json({
            message: "Internal server error",
            status: false,
            data: null,
        });
    }
};

//------------------< DELETE JOBS >------------------//
exports.deleteJobDescription = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedJobDescription = await JOBDESCRIPTION.findByIdAndDelete(id);

        if (!deletedJobDescription) {
            return res.status(404).json({
                message: "Job Description not found",
                status: false,
                data: null,
            });
        }

        res.status(200).json({
            message: "Job Description deleted successfully",
            status: true,
            data: deletedJobDescription,
        });
    } catch (error) {
        console.error("Error deleting job description:", error.message);
        res.status(500).json({
            message: "Internal server error",
            status: false,
            data: null,
        });
    }
};

//------------------< JOB CATEGORIES >------------------//
exports.getJobsByCategory = async (req, res) => {
    const { categoryId } = req.params;

    try {
        const jobs = await JOBDESCRIPTION.find({ category: categoryId })
            .populate('category', 'job_name description') // Populate category details
            .sort({ title: 1 });

        res.status(200).json({
            message: 'Jobs fetched successfully',
            status: true,
            data: jobs,
        });
    } catch (error) {
        console.error('Error fetching jobs:', error.message);
        res.status(500).json({
            message: 'Internal server error',
            status: false,
            data: null,
        });
    }
};

//------------------< SEARCH JOBS >------------------//
exports.searchJobDescription = async (req, res) => {
    try {
        const { query = "", page = 1, limit = 10 } = req.query;

        // Parse `page` and `limit` to integers
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Validate pagination inputs
        if (pageNum < 1 || limitNum < 1) {
            return res.status(400).json({
                success: false,
                message: "Page and limit must be positive integers.",
            });
        }

        // Construct search filter
        const searchFilter = query
            ? {
                $or: [
                    { "job_title": { $regex: query, $options: "i" } },  // Search in job_title
                    { "company_name": { $regex: query, $options: "i" } },  // Search in company_name
                    { "key_skills": { $regex: query, $options: "i" } },  // Search in key_skills
                    { "location": { $regex: query, $options: "i" } },
                    { "qualification": { $regex: query, $options: "i" } },
                    { "category.job_name": { $regex: query, $options: "i" } }, // Search in nested field category.job_name
                ],
            }
            : {};

        // Perform the search with pagination
        const results = await JOBDESCRIPTION.find(searchFilter)
            .populate("category", "job_name description") // Populate category details
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .sort({ createdAt: -1 }); // Sort by `createdAt` in descending order

        // Get the total count of matching documents
        const total = await JOBDESCRIPTION.countDocuments(searchFilter);
        const totalPages = Math.ceil(total / limitNum);

        // Respond with paginated results
        res.status(200).json({
            message: "Jobs fetched successfully",
            success: true,
            data: results,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages,
        });
    } catch (error) {
        console.error("Error searching job descriptions:", error.message);
        res.status(500).json({
            success: false,
            message: "An error occurred while searching job descriptions.",
            error: error.message,
        });
    }
};

//------------------< PAGINATION JOB >------------------//
exports.paginationJobDescription = async (req, res) => {
    try {
        // Parse and validate query parameters
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;

        if (pageNum < 1 || limitNum < 1) {
            res.status(400).json({ success: false, message: "Page and limit must be positive integers." });
            return;
        }

        // Query the database with pagination and sorting
        const result = await JOBDESCRIPTION.find()
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .sort({ createdAt: -1 }); // Sort by `createdAt` (newest first)

        const total = await JOBDESCRIPTION.countDocuments(); // Get the total number of documents
        const totalPages = Math.ceil(total / limitNum);

        // Send response
        res.status(200).json({ success: true, data: result, total, page: pageNum, limit: limitNum, totalPages, });
    } catch (error) {
        // Handle server errors
        res.status(500).json({ success: false, message: "An error occurred while fetching media.", error: error.message, });
    }
};