const JOBDESCRIPTION = require('../models/JdModel');

//------------------< CREATE JD >------------------//
exports.createJd = async (req, res) => {
    const adminId = req.user?.id;
    if (!req.body) {
        return res.status(400).json({ message: "All fields are mandatory" });
    }
    const existingJobId = await JOBDESCRIPTION.findOne({ job_id });
    if (existingJobId) {
        return res.status(400).json({ message: "Job ID already exists" });
    }
    try {
        const {
            job_title,
            job_id,
            start_date,
            close_date,
            location,
            position,
            job_function,
            key_skills,
            company_name,
            qualification,
            experience: {
                e_min,
                e_max,
            },
            salary: {
                s_min,
                s_max,
            },
            job_description,
        } = req.body;
        const createData = await JOBDESCRIPTION.create({
            userId: adminId,
            job_title,
            job_id,
            start_date,
            close_date,
            location,
            position,
            job_function,
            key_skills,
            company_name,
            qualification,
            experience: {
                e_min,
                e_max,
            },
            salary: {
                s_min,
                s_max,
            },
            job_description,
        });

        return res.status(200).json({ message: "Job Description created", data: createData });
    } catch (err) {
        console.error("Error creating job description:", err.message);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

//------------------< JD BY ADMIN >------------------//
exports.getJdByAdmin = async (req, res) => {
    const jdId = req.user?.id;
    try {
        // Fetch jd by userId
        const jobs = await JOBDESCRIPTION.find({ jdId });
        // If no jobd found, return 404
        if (!jobs.length === 0) {
            return res.status(404).json({ message: 'No jobd found for this admin.' });
        }
        return res.status(200).json({ message: 'jobs created by admin', data: jobs });
    } catch (error) {
        // Log the error and send a 500 status code
        console.error('Error fetching jobs:', error);
        return res.status(500).json({ message: 'Failed to fetch jobs. Please try again later.' });
    }
};
//------------------< GET SINGLE DATA >------------------//
exports.singleJd = async (req, res) => {
    const { id } = req.params;
    try {
        const jobs = await JOBDESCRIPTION.findById(id);
        if (!jobs) {
            return res.status(404).json({ message: "Job data not found" });
        }
        return res.status(200).json({ message: "Single job data find successfully", data: jobs });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

//------------------< UPDATE JD >------------------//
exports.updateJd = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Id found for updated", id)
        const jobUpdated = await JOBDESCRIPTION.findByIdAndUpdate(id, req.body, { new: true });
        console.log("job update is done", jobUpdated)
        if (!jobUpdated) {
            return res.status(404).json({ message: "data not found" });
        }
        return res.status(200).json({ message: "Updated", jobUpdated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
//------------------< DELETE JD >------------------//
exports.deleteJd = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await JOBDESCRIPTION.findByIdAndDelete(id, req.body, { new: true });
        if (!data) {
            return res.status(404).json({ message: "Jd not found" });
        }
        return res.status(200).json({ message: "Deleted", data });
    } catch (err) {
        console.error("Error deleting recruiter data:", err.message);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};