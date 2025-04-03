const JOBAPPLY = require('../models/JobApplyModel');
const JOBDESCRIPTION = require('../models/JdModel');
const { sendRealTimeNotification } = require('../middlewares/notificationMiddleware');


//------------------< APPLY JOB >------------------//
exports.applyForJob = async (req, res) => {
    try {
        const applicantId = req.user?.id;
        const { jobId } = req.body;

        // Validate if the job exists
        const job = await JOBDESCRIPTION.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found', status: false });
        }
        // Check if the applicant has already applied for this job
        const existingApplication = await JOBAPPLY.findOne({ applicantId, jobId });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job', status: false });
        }

        const resume = req.files?.resume?.[0]?.filename;
        if (!resume) {
            return res.status(400).json({ message: "Resume is required", Status: false });
        }
        // Create a new application
        const application = new JOBAPPLY({
            applicantId,
            resume,
            jobId
        });

        const savedApplication = await application.save();
        return res.status(201).json({ message: 'Application submitted successfully', status: true, data: savedApplication });
    } catch (error) {
        console.error('Error applying for job:', error.message);
        return res.status(500).json({ message: 'Internal server error', status: false });
    }
};
//------------------< UPDATE STATUS >------------------//
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params; // Application ID
        const applicantId = req.user?.id;
        const { status, feedback } = req.body; // New status and feedback
        const recruiterId = req.user?.id; // Extract recruiter ID from token (assumes middleware sets req.user)

        // Check if recruiterId is available
        if (!recruiterId) {
            return res.status(401).json({ message: 'Unauthorized: Recruiter ID missing', status: false });
        }

        // Validate application existence
        const application = await JOBAPPLY.findById(id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found', status: false });
        }

        // Update status, feedback, and recruiter action details
        application.status = status || application.status;
        application.feedback = feedback || application.feedback;
        application.recruiterActionDate = new Date();
        application.recruiterId = recruiterId; // Associate recruiter ID

        const updatedApplication = await application.save();
        // Send notification to the applicant
        if (sendRealTimeNotification) {
            sendRealTimeNotification(applicantId, {
                status,
                feedback,
            });
        }
        return res.status(200).json({ message: 'Application updated successfully', status: true, data: updatedApplication });
    } catch (error) {
        console.error('Error updating application status:', error.message);
        return res.status(500).json({ message: 'Internal server error', status: false });
    }
};
//------------------< APPLICATION BY JOB ID >------------------//
exports.getApplicationsByJobId = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Fetch all applications for a specific job
        const applications = await JOBAPPLY.find({ jobId }).populate('jobId', 'job_title location');

        if (!applications.length) {
            return res.status(404).json({ message: 'No applications found for this job', status: false });
        }

        return res.status(200).json({ message: 'Applications fetched successfully', status: true, data: applications });
    } catch (error) {
        console.error('Error fetching applications:', error.message);
        return res.status(500).json({ message: 'Internal server error', status: false });
    }
};
//------------------< All APPLY JOB >------------------//
exports.getAllApplyJob = async (req, res) => {
    try {
        // Fetch all applications
        const applications = await JOBAPPLY.find().populate('jobId', 'job_title location')
            .populate('applicantId', 'name email mobile');
        if (!applications.length) {
            return res.status(404).json({ message: 'No applications found for this job', status: false });
        }
        return res.status(200).json({ message: 'Apply Applications fetched successfully', status: true, data: applications });
    } catch (error) {
        console.error('Error fetching applications:', error.message);
        return res.status(500).json({ message: 'Internal server error', status: false });
    }
};
//------------------< GET APPLICATION DETAILS >------------------//
exports.getApplicationDetails = async (req, res) => {
    try {
        const { id } = req.params; // Application ID
        if (!id) {
            return res.status(400).json({
                message: 'Application ID is required',
                status: false,
                data: null,
            });
        }

        // Fetch application by ID
        const application = await JOBAPPLY.findById(id)
            .populate('jobId', 'job_title location')
            .populate('applicantId', 'name first_name last_name email')
            .populate('recruiterId', 'name first_name last_name email')
            .sort({ applicationDate: -1 });

        if (!application) {
            return res.status(404).json({
                message: 'Application not found',
                status: false,
                data: null,
            });
        }

        // Format the response data
        const responseData = {
            applicationId: application._id,
            job: application.jobId
                ? {
                    id: application.jobId._id,
                    job_title: application.jobId.job_title,
                    location: application.jobId.location,
                }
                : null, // Handle missing job data
            applicant: application.applicantId
                ? {
                    id: application.applicantId._id,
                    name: `${application.applicantId.name?.first_name || ''} ${application.applicantId?.name?.last_name || ''}`.trim(),
                    email: application.applicantId.email,
                }
                : null,
            recruiter: application.recruiterId
                ? {
                    id: application.recruiterId._id,
                    name: `${application.recruiterId.name?.first_name || ''} ${application.recruiterId.name?.last_name || ''}`.trim(),
                    email: application.recruiterId.email,
                }
                : null, // Handle missing recruiter data
            status: application.status,
            feedback: application.feedback || 'No feedback yet',
            applicationDate: application.applicationDate,
            recruiterActionDate: application.recruiterActionDate || 'Pending',
        };

        // Send the response
        return res.status(200).json({
            message: 'Application details fetched successfully',
            status: true,
            data: responseData,
        });
    } catch (error) {
        console.error('Error fetching application details:', error.message);
        return res.status(500).json({
            message: 'Internal server error',
            status: false,
        });
    }
};
//------------------< APPLICANT TRACK APPLICATION >------------------//
exports.trackApplications = async (req, res) => {
    try {
        const applicantId = req.user?.id; // Assuming the applicant's ID is extracted from the token
        if (!applicantId) {
            return res.status(400).json({
                message: 'Applicant ID is required',
                status: false,
                data: null,
            });
        }

        // Retrieve all applications for the applicant
        const applications = await JOBAPPLY.find({ applicantId })
            .populate('jobId', 'job_title location') // Populate job details
            .populate('applicantId', 'name first_name last_name email')
            .populate('recruiterId', 'name first_name last_name email') // Populate recruiter details if available
            .sort({ applicationDate: -1 }); // Sort by the most recent applications
        // Check if applications exist
        if (!applications || applications.length === 0) {
            return res.status(404).json({
                message: 'No applications found',
                status: false,
                data: null,
            });
        }

        // Format response data
        const responseData = {
            applicant: {
                id: req.user?.id,
                // name: `${req.user?.details?.name?.first_name || ''} ${req.user?.details?.name?.last_name || ''}`.trim(),
                // resume: req.user?.details?.resume || 'Not available',
                email: req.user?.email,
            },
            applications: applications.map((app) => ({
                applicationId: app._id,
                job: app.jobId
                    ? {
                        id: app.jobId._id,
                        job_title: app.jobId.job_title,
                        location: app.jobId.location,
                    }
                    : null, // Handle missing job data
                recruiter: app.recruiterId
                    ? {
                        id: app.recruiterId._id,
                        name: `${app.recruiterId?.name?.first_name || ''} ${app.recruiterId?.name?.last_name || ''}`.trim(),
                        email: app.recruiterId.email,
                    }
                    : null, // Handle missing recruiter data
                status: app.status,
                feedback: app.feedback || 'No feedback yet',
                applicationDate: app.applicationDate,
                recruiterActionDate: app.recruiterActionDate || 'Pending',
            })),
        };
        // Return the formatted response
        res.status(200).json({
            message: 'Applications retrieved successfully',
            status: true,
            data: responseData,
        });
    } catch (error) {
        console.error('Error tracking applications:', error.message);
        res.status(500).json({
            message: 'Internal server error',
            status: false,
            data: null,
        });
    }
};
//------------------< APPLICANT NOTIFICATION READ >------------------//
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Notification ID is required' });
        }

        const updatedNotification = await JOBAPPLY.findByIdAndUpdate(id, { is_read: true }, { new: true, runValidators: true })
            .populate('jobId', 'job_title location') // Populate job details
            .populate('applicantId', 'name first_name last_name email')
            .populate('recruiterId', 'name first_name last_name email') // Populate recruiter details if available
            .sort({ applicationDate: -1 });;
        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({
            message: 'Notification marked as read',
            data: updatedNotification,
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({
            message: 'Failed to mark notification as read',
            error: error.message,
        });
    }
};
