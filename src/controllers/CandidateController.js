const CANDIDATE = require('../models/CandidateModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../config')

//------------------< REGISTER CANDIDATE >------------------//
exports.candidateRegister = async (req, res) => {
    try {
        const { first_name, last_name, gender, email, mobile, job_function, current_location, years, months, key_skills, password } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !gender || !email || !mobile || !job_function || !current_location || !years || !months || !key_skills || !password) {
            return res.status(400).json({ message: "All fields are mandatory", Status: false });
        }

        // Check if email is already registered
        const existingCandidate = await CANDIDATE.findOne({
            $or: [
                { email: email },
                { mobile: mobile }
            ]
        });
        if (existingCandidate) {
            let conflictField = existingCandidate.email === email ? 'email' : 'mobile';
            return res.status(400).json({
                message: `Candidate with the provided ${conflictField} already exists`,
                status: false
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle file uploads
        const profileImage = req.files?.profileImage?.[0]?.filename || null;
        const resume = req.files?.resume?.[0]?.filename;

        if (!resume) {
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
            gender,
            job_function,
            current_location,
            experience: {
                years,
                months,
            },
            key_skills,
            password: hashedPassword,
            profileImage,
            resume,
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
        const candidate = await CANDIDATE.findOne({
            $or: [{ email: identifier }, { mobile: identifier }],
        });

        if (!candidate) {
            return res.status(401).json({
                message: 'Invalid email or mobile',
                status: false,
                data: null,
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, candidate.password);
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
                    user_name: candidate.user_name,
                    email: candidate.email,
                    id: candidate._id,
                },
            },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: '200m' }
        );

        // Respond with success
        res.status(200).json({
            message: 'Candidate login successful',
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
        return res.status(200).json({ message: "All candidate retrieved successfull!", data: candidate });
    } catch (err) {
        console.error("Error fetching data:", err.message);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

//------------------< CANDIDATE BY ID >------------------//
exports.getCandidateById = async (req, res) => {
    const { id } = req.params;
    try {
        const candidate = await CANDIDATE.findById(id);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found", Status: false });
        }

        return res.status(200).json({
            message: "Single candidate fetched successfully",
            Status: true,
            data: candidate,
        });
    } catch (error) {
        console.error("Error fetching candidate:", error);
        return res.status(500).json({
            message: "Internal server error",
            Status: false,
            error: error.message
        });
    }
};
//------------------< PROFILE CANDIDATE >------------------//
exports.getCandidateProfile = async (req, res) => {
    try {
        const candidateId = req.user?.id;
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
        const { first_name, last_name, gender, email, mobile, job_function, current_location, years, months, key_skills, password } = req.body;

        // Find candidate by ID
        const candidate = await CANDIDATE.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found", Status: false });
        }
        // Handle file uploads
        const profileImage = req.files?.profileImage?.[0]?.filename || candidate.profileImage;
        const resume = req.files?.resume?.[0]?.filename || candidate.resume;
        // Update candidate fields
        candidate.name.first_name = first_name || candidate.name.first_name;
        candidate.name.last_name = last_name || candidate.name.last_name;
        candidate.gender = gender || candidate.gender;
        candidate.email = email || candidate.email;
        candidate.mobile = mobile || candidate.mobile;
        candidate.job_function = job_function || candidate.job_function;
        candidate.current_location = current_location || candidate.current_location;
        candidate.experience.years = years || candidate.experience.years;
        candidate.experience.months = months || candidate.experience.months;
        candidate.key_skills = key_skills || candidate.key_skills;

        if (password) {
            const saltRounds = 10;
            candidate.password = await bcrypt.hash(password, saltRounds);
        }

        // Update profile image if provided
        if (profileImage) {
            candidate.profileImage = profileImage;
        }
        // Update resume if a file is uploaded
        if (resume) {
            candidate.resume = resume;
        }
        // Save updated candidate profile
        const updatedCandidate = await candidate.save();

        // Success response
        return res.status(200).json({ message: "Candidate profile updated successfully!", Status: true, data: updatedCandidate, });
    } catch (error) {
        console.error("Error in updating candidate profile:", error.message);
        return res.status(500).json({ message: "Internal Server Error", Status: false });
    }
};

//------------------< DELETE CANDIDATE >------------------//
exports.deleteCandidate = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCandidate = await CANDIDATE.findByIdAndDelete(id);
        if (!deletedCandidate) {
            return res.status(404).json({ message: "Candidate not found", Status: false });
        }

        return res.status(200).json({
            message: "Candidate deleted successfully",
            Status: true,
        });
    } catch (error) {
        console.error("Error deleting condidate:", error);
        return res.status(500).json({
            message: "Internal server error",
            Status: false,
            error: error.message
        });
    }
};

//------------------< DELETE CANDIDATE ACCOUNT >------------------//
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
