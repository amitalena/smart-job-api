const ADMIN = require('../models/AdminModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const transporter = require('../../CONFIG/emailConfig.js')
// Import the function from recruiterController.js
const RECRUITER = require('../models/RecruiterModel.js');
const JOBDESCRIPTION = require('../models/JdModel.js');
const CANDIDATE = require('../models/CandidateModel.js');

//------------------< CREATE ADMIN >------------------//
exports.createAdmin = async (req, res) => {
    try {
        const { user_name, first_name, last_name, email, mobile, password, confirm_password } = req.body;
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        const existingAdmin = await ADMIN.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ message: 'Email is already in use' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const adminData = {
            user_name,
            name: { first_name, last_name },
            email,
            mobile,
            password: hashedPassword,
            confirm_password: hashedPassword
        };
        if (req.file) {
            adminData.profileImage = req.file.filename;
        }
        const admin = new ADMIN(adminData);
        await admin.save();
        res.status(201).json({ message: 'Admin created successfully', data: admin });
    } catch (error) {
        console.error('Error creating admin:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//------------------< LOGIN ADMIN >------------------//
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: 'All fields are mandatory',
            status: false,
            data: null,
        });
    }
    try {
        const admin = await ADMIN.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                message: 'Invalid Email or Password',
                status: false,
                data: null,
            });
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        console.log("password of admin", isPasswordValid)
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid Email or Password',
                status: false,
                data: null,
            });
        }
        const accessToken = jwt.sign({
            user: {
                user_name: admin.user_name,
                email: admin.email,
                id: admin._id,
            },
        }, config.ACCESS_TOKEN_SECRET, { expiresIn: '200m' });
        res.status(200).json({
            message: 'Login Successful',
            status: true,
            data: {
                accessToken,
                email: admin.email,
                role: admin.role,
                details: admin,
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

//------------------< PROFILE ADMIN >------------------//
exports.getProfile = async (req, res) => {
    try {
        const adminId = req.user?.id;
        console.log("admin id", adminId)
        const admin = await ADMIN.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                message: 'Admin not found',
                status: false,
                data: null,
            });
        }
        res.status(200).json({
            message: 'Profile fetched successfully',
            status: true,
            data: admin,
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

//------------------< UPDATE PROFILE >------------------//
exports.updateProfile = async (req, res) => {
    try {
        const adminId = req.user?.id; // Get admin ID from request user
        const { first_name, last_name, user_name, email, mobile, password } = req.body;
        const profileImage = req.file ? req.file.filename : null; // Check for uploaded file

        // Validate if admin exists
        const admin = await ADMIN.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                message: 'Admin not found',
                status: false,
                data: null,
            });
        }

        // Update admin fields based on the request body
        if (first_name) admin.name.first_name = first_name; // Update first name
        if (last_name) admin.name.last_name = last_name; // Update last name
        if (user_name) admin.user_name = user_name; // Update username
        if (email) admin.email = email; // Update email
        if (mobile) admin.mobile = mobile; // Update mobile

        // Hash the new password if provided
        if (password) {
            const saltRounds = 10;
            admin.password = await bcrypt.hash(password, saltRounds);
        }

        // Update profile image if provided
        if (profileImage) {
            admin.profileImage = profileImage;
        }

        // Save the updated profile to the database
        const updatedAdmin = await admin.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            status: true,
            data: updatedAdmin, // Return the updated admin object
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            message: 'Internal server error',
            status: false,
            data: null,
        });
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

//------------------< RECRUITER BY ADMIN >------------------//
exports.getRecruitersByAdmin = async (req, res) => {
    const recruiterId = req.user?.id;
    try {
        // Fetch recruiters by userId
        const recruiters = await RECRUITER.find({ recruiterId });

        // If no recruiters found, return 404
        if (!recruiters.length === 0) {
            return res.status(404).json({ message: 'No recruiters found for this admin.', data: recruiters });
        }

        // Send successful response with recruiters
        console.log("admin by id", recruiters)
        return res.status(200).json({ message: 'Recruiters created by admin', data: recruiters });
    } catch (error) {
        // Log the error and send a 500 status code
        console.error('Error fetching recruiters:', error);
        return res.status(500).json({ message: 'Failed to fetch recruiters. Please try again later.' });
    }
};

//------------------< LOGOUT ADMIN >------------------//
exports.logoutAdmin = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            res.json({ message: 'Logout successfully...' });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

//------------------< SEND JD MULTIPULE EMAILS >------------------//
exports.sendMultipleEmails = async (req, res) => {
    const emailAddresses = req.body.emails;
    const emailtext = req.body.text;
    const emailStatus = [];

    for (let email of emailAddresses) {
        try {
            await transporter.sendMail({
                from: config.EMAIL_FROM,
                to: email,
                subject: "Password Reset OTP",
                text: emailtext
            });
            emailStatus.push({ email: email, status: 'Success' });
        } catch (error) {
            emailStatus.push({ email: email, status: 'Failed', error: error.message });
        }
    }

    res.status(200).json({ message: 'Emails processed', status: emailStatus });
};

//------------------< DELETE CANDIDATE ACCOUNT >------------------//
exports.deleteCandidateAccount = async (req, res) => {
    try {
        const candidateId = req.user?.id;
        // Find and delete the candidate's account
        const deletedCandidate = await CANDIDATE.findByIdAndDelete(candidateId);

        if (!deletedCandidate) {
            return res.status(404).json({
                message: 'Candidate not found',
                status: false,
                data: null,
            });
        }
        res.status(200).json({
            message: 'Account deleted successfully',
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
//------------------< DELETE RECRUITER ACCOUNT >------------------//
exports.deleteRecruiterAccount = async (req, res) => {
    try {
        const recruiterId = req.user?.id;
        // Find and delete the recruiter's account
        const deletedRecruiter = await RECRUITER.findByIdAndDelete(recruiterId);

        if (!deletedRecruiter) {
            return res.status(404).json({
                message: 'Recruiter not found',
                status: false,
                data: null,
            });
        }
        res.status(200).json({
            message: 'Account deleted successfully',
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