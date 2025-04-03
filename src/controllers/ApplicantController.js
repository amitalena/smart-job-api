const APPLICANT = require('../models/ApplicantModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../config');
const JOBAPPLY = require('../models/JobApplyModel');

//------------------< REGISTER APPLICANT >------------------//
exports.createApplicant = async (req, res) => {
    try {
        const { first_name, last_name, email, designation, mobile, dob, gender, city, locality,
            pin_code, state, years, months, skills, password, description, current_company } = req.body;

        // Check if all required fields are provided
        if (!first_name || !last_name || !email || !designation || !mobile || !dob || !gender || !city || !locality || !pin_code || !state || !skills || !years || !months || !description || !current_company) {
            return res.status(400).json({ message: "All fields are mandatory", Status: false });
        }
        // Check if email is already registered
        const existingApplicant = await APPLICANT.findOne({
            $or: [
                { email: email },
                { mobile: mobile }
            ]
        });
        if (existingApplicant) {
            let conflictField = existingApplicant.email === email ? 'email' : 'mobile';
            return res.status(400).json({
                message: `Applicant with the provided ${conflictField} already exists`,
                status: false
            });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle file uploads
        const profileImage = req.files?.profileImage?.[0]?.filename || null;
        const resume = req.files?.resume?.[0]?.filename;

        if (!resume) {
            return res.status(400).json({ message: "Applicant resume is required", Status: false });
        }

        // Create the new application
        const newApplicant = await APPLICANT.create({
            name:
            {
                first_name, last_name
            },
            email, designation, mobile,
            address: {
                pin_code, locality, city, state
            }, dob, gender,
            experience:
                { years, months },
            password: hashedPassword,
            description, current_company, skills, profileImage,
            resume,
        });
        const applicant = await newApplicant.save();
        // Respond with success
        return res.status(200).json({ message: "Application created successfully", Status: true, data: applicant });

    } catch (error) {
        console.error("Error creating application:", error);
        return res.status(500).json({ message: "Internal server error", Status: false, error: error.message });
    }
};

//------------------< ALL APPLICANT >------------------//
exports.getAllApplicant = async (req, res) => {
    try {
        const applicant = await APPLICANT.find({});
        return res.status(200).json({
            message: "Applicant fetched successfully",
            Status: true,
            data: applicant
        });
    } catch (error) {
        console.error("Error fetching applicant:", error);
        return res.status(500).json({
            message: "Internal server error",
            Status: false,
            error: error.message
        });
    }
};

//------------------< APPLICANT BY ID >------------------//
exports.getApplicantById = async (req, res) => {
    const { id } = req.params;
    try {
        const application = await APPLICANT.findById(id);
        if (!application) {
            return res.status(404).json({ message: "Applicant not found", Status: false });
        }

        return res.status(200).json({
            message: "Applicant fetched successfully",
            Status: true,
            data: application
        });
    } catch (error) {
        console.error("Error fetching applicant:", error);
        return res.status(500).json({
            message: "Internal server error",
            Status: false,
            error: error.message
        });
    }
};

//------------------< APPLICANT LOGIN >------------------//
exports.loginApplicant = async (req, res) => {
    const { identifier, password } = req.body;
    // Validate input
    if (!identifier || !password) {
        return res.status(400).json({
            message: 'Both identifier and password are required',
            status: false,
            data: null,
        });
    }

    try {
        // Find candidate by email or mobile
        const applicant = await APPLICANT.findOne({
            $or: [{ email: identifier }, { mobile: identifier }],
        });

        if (!applicant) {
            return res.status(401).json({
                message: 'Invalid email or mobile',
                status: false,
                data: null,
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, applicant.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid password',
                status: false,
                data: null,
            });
        }

        // Generate JWT token
        const accessToken = jwt.sign(
            {
                user: {
                    user_name: applicant.user_name,
                    email: applicant.email,
                    id: applicant._id,
                },
            },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: '200m' }
        );

        // Respond with success
        res.status(200).json({
            message: 'Applicant login successful',
            status: true,
            data: {
                accessToken,
                email: applicant.email,
                role: applicant.role,
                details: applicant,
            },
        });
    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).json({
            message: 'Internal server error',
            status: false,
            data: null,
        });
    }
};

//------------------< PROFILE APPLICANT >------------------//
exports.getApplicantProfile = async (req, res) => {
    try {
        const applicantId = req.user?.id;
        const applicant = await APPLICANT.findById(applicantId);
        if (!applicant) {
            return res.status(404).json({
                message: 'Applicant not found',
                status: false,
                data: null,
            });
        }
        res.status(200).json({
            message: 'Profile fetched successfully',
            status: true,
            data: applicant,
        });
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({
            message: 'Internal server error',
            status: false,
            data: null,
        });
    }
};

//------------------< PROFILE UPDATE >------------------//
exports.updateApplicantProfile = async (req, res) => {
    try {
        const applicantId = req.user?.id; // Assuming Applicant ID is passed in the URL
        const {
            first_name, last_name, email, designation, mobile, dob, gender, city, locality,
            pin_code, state, years, months, skills, description, current_company
        } = req.body;

        // Find Applicant by ID
        const applicant = await APPLICANT.findById(applicantId);
        if (!applicant) {
            return res.status(404).json({ message: "Applicant not found", Status: false });
        }
        // Handle file uploads
        const profileImage = req.files?.profileImage?.[0]?.filename || applicant.profileImage;
        const resume = req.files?.resume?.[0]?.filename || applicant.resume;
        // Update Applicant fields
        applicant.name.first_name = first_name || applicant.name.first_name;
        applicant.name.last_name = last_name || applicant.name.last_name;
        applicant.gender = gender || applicant.gender;
        applicant.designation = designation || applicant.designation;
        applicant.dob = dob || applicant.dob;
        applicant.address.city = city || applicant.address.city;
        applicant.address.locality = locality || applicant.address.locality;
        applicant.address.pin_code = pin_code || applicant.address.pin_code;
        applicant.address.state = state || applicant.address.state;
        applicant.description = description || applicant.description;
        applicant.email = email || applicant.email;
        applicant.mobile = mobile || applicant.mobile;
        applicant.current_company = current_company || applicant.current_company;
        applicant.experience.years = years || applicant.experience.years;
        applicant.experience.months = months || applicant.experience.months;
        applicant.skills = skills || applicant.skills;

        // Update profile image if provided
        if (profileImage) {
            applicant.profileImage = profileImage;
        }
        // Update resume if a file is uploaded
        if (resume) {
            applicant.resume = resume;
        }
        // Save updated Applicant profile
        const updatedApplicant = await applicant.save();

        // Success response
        return res.status(200).json({ message: "Applicant profile updated successfully!", Status: true, data: updatedApplicant, });
    } catch (error) {
        console.error("Error in updating applicant profile:", error.message);
        return res.status(500).json({ message: "Internal Server Error", Status: false });
    }
};

//------------------< DELETE APPLICANT >------------------//
exports.deleteApplicant = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedApplicant = await APPLICANT.findByIdAndDelete(id);
        if (!deletedApplicant) {
            return res.status(404).json({ message: "Applicant not found", Status: false });
        }

        return res.status(200).json({
            message: "Applicant deleted successfully",
            Status: true,
        });
    } catch (error) {
        console.error("Error deleting applicant:", error);
        return res.status(500).json({
            message: "Internal server error",
            Status: false,
            error: error.message
        });
    }
};

//------------------< DELETE APPLICANT ACCOUNT >------------------//
exports.deleteApplicantAccount = async (req, res) => {
    try {
        const applicantId = req.user?.id;
        const deletedApplicant = await APPLICANT.findByIdAndUpdate(
            applicantId,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!deletedApplicant) {
            return res.status(404).json({
                message: 'Applicant not found',
                status: false,
                data: null,
            });
        }
        res.status(200).json({
            message: 'Account marked as deleted successfully',
            status: true,
            data: null,
        });
    } catch (error) {
        console.error('Error deleting account:', error.message);
        res.status(500).json({
            message: 'Internal server error',
            status: false,
            data: null,
        });
    }
};

//------------------< GET ALL DELETE ACCOUNT >------------------//
exports.getDeletedAccounts = async (req, res) => {
    try {
        const deletedApplicant = await APPLICANT.find({ isDeleted: true });
        if (deletedApplicant.length === 0) {
            return res.status(404).json({
                message: 'No deleted applicant found',
                status: false,
                data: null,
            });
        }

        res.status(200).json({
            message: 'Deleted applicant retrieved successfully',
            status: true,
            data: deletedApplicant,
        });
    } catch (error) {
        console.error('Error retrieving deleted applicant:', error.message);
        res.status(500).json({
            message: 'Internal server error',
            status: false,
            data: null,
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
                id: req.user?.id, // ID from the token
                name: `${req.user?.name?.first_name || ''} ${req.user?.name?.last_name || ''}`.trim(),
                email: req.user?.email,
            },
            applications: applications.map((app) => ({
                applicationId: app._id,
                applicant: app.applicantId
                    ? {
                        id: req.user?.id, // ID from the token
                        name: `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
                        email: req.user?.email,
                    } : null,
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
