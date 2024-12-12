const CANDIDATE = require('../models/CandidateModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../config')

//------------------< REGISTER CANDIDATE >------------------//
exports.candidateRegister = async (req, res) => {
    try {
        const { first_name, last_name, email, mobile, job_function, current_location, years, months, key_skills, password } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email || !mobile || !job_function || !current_location || !years || !months || !key_skills || !password) {
            return res.status(400).json({ message: "All fields are mandatory", Status: false });
        }

        // Check if email is already registered
        const existingCandidate = await CANDIDATE.findOne({ email });
        if (existingCandidate) {
            return res.status(400).json({ message: "Email is already registered", Status: false });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle file uploads
        const profileImage = req.files?.profileImage?.[0]?.filename || null;
        const candidateResume = req.files?.candidateResume?.[0]?.filename;

        if (!candidateResume) {
            return res.status(400).json({ message: "Candidate resume is required", Status: false });
        }

        // Create new candidate object
        const newCandidate = new CANDIDATE({
            name: {
                first_name,
                last_name,
            },
            email,
            mobile,
            job_function,
            current_location,
            experience: {
                years,
                months,
            },
            key_skills,
            password: hashedPassword,
            profileImage,
            candidateResume,
        });

        // Save candidate to the database
        const candidate = await newCandidate.save();

        // Success response
        return res.status(201).json({
            message: "Candidate registered successfully!",
            Status: true,
            data: candidate,
        });
    } catch (error) {
        console.error("Error in candidate registration:", error.message);
        return res.status(500).json({ message: "Internal Server Error", Status: false });
    }
};

//------------------< LOGIN CANDIDATE >------------------//
exports.candidateLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: 'All fields are mandatory',
            status: false,
            data: null,
        });
    }
    try {
        const candidate = await CANDIDATE.findOne({ email });
        if (!candidate) {
            return res.status(401).json({
                message: 'Invalid Email or Password',
                status: false,
                data: null,
            });
        }
        const isPasswordValid = await bcrypt.compare(password, candidate.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid Email or Password',
                status: false,
                data: null,
            });
        }
        const accessToken = jwt.sign({
            user: {
                user_name: candidate.user_name,
                email: candidate.email,
                id: candidate._id,
            },
        }, config.ACCESS_TOKEN_SECRET, { expiresIn: '200m' });
        res.status(200).json({
            message: 'Login Successful',
            status: true,
            data: {
                accessToken,
                email: candidate.email,
                role: candidate.role,
                details: candidate,
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

//------------------< GET ALL EMPOLYEE >------------------//
exports.candidateGetAll = async (req, res) => {
    try {
        const candidate = await CANDIDATE.find({});
        return res.status(200).json({ message: "Candidate All Data", data: candidate });
    } catch (err) {
        console.error("Error fetching data:", err.message);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

//------------------< PROFILE CANDIDATE >------------------//
exports.getCandidateProfile = async (req, res) => {
    try {
        const candidateId = req.user?.id;
        console.log("candidate id", candidateId)
        const candidate = await CANDIDATE.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({
                message: 'Candidate not found',
                status: false,
                data: null,
            });
        }
        res.status(200).json({
            message: 'Profile fetched successfully',
            status: true,
            data: candidate,
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
exports.updateCandidateProfile = async (req, res) => {
    try {
        const candidateId = req.user?.id; // Assuming candidate ID is passed in the URL
        const { first_name, last_name, email, mobile, job_function, current_location, years, months, key_skills } = req.body;

        // Find candidate by ID
        const candidate = await CANDIDATE.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found", Status: false });
        }

        // Update fields if provided
        if (first_name) candidate.name.first_name = first_name;
        if (last_name) candidate.name.last_name = last_name;
        if (email) {
            // Check if new email is already registered
            const existingCandidate = await CANDIDATE.findOne({ email, _id: { $ne: candidateId } });
            if (existingCandidate) {
                return res.status(400).json({ message: "Email is already registered by another user", Status: false });
            }
            candidate.email = email;
        }
        if (mobile) candidate.mobile = mobile;
        if (job_function) candidate.job_function = job_function;
        if (current_location) candidate.current_location = current_location;
        if (years) candidate.experience.years = years;
        if (months) candidate.experience.months = months;
        if (key_skills) candidate.key_skills = key_skills;

        // Handle file uploads
        if (req.files?.profileImage?.[0]?.filename) {
            candidate.profileImage = req.files.profileImage[0].filename;
        }
        if (req.files?.candidateResume?.[0]?.filename) {
            candidate.candidateResume = req.files.candidateResume[0].filename;
        }

        // Save updated candidate profile
        const updatedCandidate = await candidate.save();

        // Success response
        return res.status(200).json({
            message: "Candidate profile updated successfully!",
            Status: true,
            data: updatedCandidate,
        });
    } catch (error) {
        console.error("Error in updating candidate profile:", error.message);
        return res.status(500).json({ message: "Internal Server Error", Status: false });
    }
};


//------------------< DELETE CANDIDATE >------------------//
exports.deleteCandidateAccount = async (req, res) => {
    try {
        const candidateId = req.user?.id;
        const deletedCandidate = await CANDIDATE.findByIdAndUpdate(
            candidateId,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!deletedCandidate) {
            return res.status(404).json({
                message: 'Candidate not found',
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

//------------------< UPDATE CANDIDATE >------------------//
exports.updateCandidate = async (req, res) => {
    try {
        const { id } = req.params; // Candidate ID from route parameters
        const {
            first_name,
            last_name,
            email,
            mobile,
            job_function,
            current_location,
            years,
            months,
            key_skills,
            password,
        } = req.body;

        // Check if the candidate exists
        const candidate = await CANDIDATE.findById(id);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found", Status: false });
        }

        // Validate unique email if updating email
        if (email && email !== candidate.email) {
            const existingCandidate = await CANDIDATE.findOne({ email });
            if (existingCandidate) {
                return res.status(400).json({ message: "Email is already registered", Status: false });
            }
        }

        // Hash new password if provided
        let hashedPassword = candidate.password; // Keep the existing password
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Update candidate fields
        candidate.name.first_name = first_name || candidate.name.first_name;
        candidate.name.last_name = last_name || candidate.name.last_name;
        candidate.email = email || candidate.email;
        candidate.mobile = mobile || candidate.mobile;
        candidate.job_function = job_function || candidate.job_function;
        candidate.current_location = current_location || candidate.current_location;
        candidate.experience.years = years || candidate.experience.years;
        candidate.experience.months = months || candidate.experience.months;
        candidate.key_skills = key_skills || candidate.key_skills;
        candidate.password = hashedPassword;

        // Update candidateResume if a file is uploaded
        if (req.file) {
            candidate.candidateResume = req.file.filename;
        }

        // Save updated candidate to the database
        const updatedCandidate = await candidate.save();

        // Success response
        return res.status(200).json({
            message: "Candidate updated successfully!",
            Status: true,
            data: updatedCandidate,
        });

    } catch (error) {
        console.error("Error in candidate update:", error.message);
        return res.status(500).json({ message: "Internal Server Error", Status: false });
    }
};

//------------------< GET ALL DELETE ACCOUNT >------------------//
exports.getDeletedAccounts = async (req, res) => {
    try {
        const deletedCandidates = await CANDIDATE.find({ isDeleted: true });
        if (deletedCandidates.length === 0) {
            return res.status(404).json({
                message: 'No deleted candidates found',
                status: false,
                data: null,
            });
        }

        res.status(200).json({
            message: 'Deleted candidates retrieved successfully',
            status: true,
            data: deletedCandidates,
        });
    } catch (error) {
        console.error('Error retrieving deleted candidates:', error.message);
        res.status(500).json({
            message: 'Internal server error',
            status: false,
            data: null,
        });
    }
};

//------------------< LOGIN CANDIDATE >------------------//
exports.candidateLogout = (req, res) => {
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