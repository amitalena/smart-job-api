const Application = require("../models/ApplicationModel1");
const Job = require("../models/JobModel"); // Assuming JobModel is defined
const { sendNotification } = require("../utils/notification"); // Assuming this utility exists


// Create a new application
const createApplication = async (req, res) => {
    try {
        const job_seeker_id = req.user?.id;
        const { job_id, status } = req.body;

        if (!job_id || !status) {
            return res.status(400).json({ message: "Job ID and status are required" });
        }

        const application = await Application.create({ job_id, job_seeker_id, status });

        res.status(201).json({
            message: "Application submitted successfully",
            application,
        });
    } catch (err) {
        console.error("Error creating application:", err);
        res.status(500).json({ message: "Error submitting application", error: err.message });
    }
};

// Track applications for a specific job seeker
const trackApplication = async (req, res) => {
    try {
        const job_seeker_id = req.user?.id;

        const applications = await Application.find({ job_seeker_id })
            .populate({
                path: "job_id",
                select: "title description location recruiter_id",
                model: Job,
            })
            .exec();

        if (!applications || applications.length === 0) {
            return res.status(404).json({ message: "No applications found" });
        }

        res.status(200).json({ applications });
    } catch (err) {
        console.error("Error fetching applications:", err);
        res.status(500).json({ message: "Error fetching applications", error: err.message });
    }
};

// Job application submission example
const submitApplication = async (req, res) => {
    try {
        const job_seeker_id = req.user?.id;
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required" });
        }

        // Save the application to the database
        const application = await Application.create({
            job_id: jobId,
            job_seeker_id,
            status: "Submitted",
        });

        // Fetch the recruiter ID associated with the job
        const job = await Job.findById(jobId).select("recruiter_id title");
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Notify the recruiter in their room
        sendNotification(req.app.get("io"), `recruiter_${job.recruiter_id}`, {
            title: "New Application Received",
            body: `A new application has been submitted for the job: ${job.title}`,
        });

        res.status(201).json({
            message: "Application submitted successfully!",
            status: true,
            application,
        });
    } catch (err) {
        console.error("Error submitting application:", err);
        res.status(500).json({ message: "Error submitting application", error: err.message });
    }
};

module.exports = { createApplication, trackApplication, submitApplication };