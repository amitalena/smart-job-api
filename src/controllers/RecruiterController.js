const RECRUITER = require('../models/RecruiterModel');
const transporter = require('../../CONFIG/emailConfig');
const generateOtp = require('./generateOTP');
const bcrypt = require('bcrypt');
const config = require('../../config');
const jwt = require('jsonwebtoken');

// Initialize recruiter data and OTP
let Dotp = null;
let vrOtpAttempts = 0;
let recruiter = {};

//------------------< CREATE RECRUITER >------------------//
exports.createRecruiter = async (req, res) => {
    const rc1Id = req.user?.id;
    console.log('Image file:', req.file);
    console.log('Request body:', req.body);

    try {
        const {
            user_name, first_name, last_name, mobile, education, gender, job_function, email, city, locality,
            pin_code, state, years, months, skills, password, description,
        } = req.body;

        // Validate input
        if (!user_name || !first_name || !last_name || !mobile || !education || !gender || !job_function || !email || !city ||
            !locality || !pin_code || !state || !years || !months || !skills || !password || !description) {
            return res.status(400).json({ message: "All fields are mandatory", status: false });
        }

        // Check if recruiter already exists
        const existingRecruiter = await RECRUITER.findOne({
            $or: [
                { email: email },
                { mobile: mobile }
            ]
        });
        if (existingRecruiter) {
            let conflictField = existingRecruiter.email === email ? 'email' : 'mobile';
            return res.status(400).json({
                message: `Recruiter with the provided ${conflictField} already exists`,
                status: false
            });
        }

        // Create recruiter object
        recruiter = {
            userId: rc1Id,
            user_name,
            name: { first_name, last_name },
            mobile,
            gender,
            education,
            skills,
            email,
            job_function,
            description,
            current_location: { city, locality, pin_code, state },
            experience: { years, months },
            password: await bcrypt.hash(password, 10),
            profileImage: req.file ? req.file.filename : "not available"
        };

        // Generate OTP and send email
        Dotp = generateOtp();
        await transporter.sendMail({
            from: config.EMAIL_FROM,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP is: ${Dotp} to verify your email`
        });

        return res.status(200).json({ message: 'OTP sent to email! Please verify your email.', status: true });

    } catch (error) {
        console.error("Error in createRecruiter:", error);
        return res.status(500).json({ message: 'Internal Server Error', status: false });
    }
};

//------------------< VERIFY OTP >------------------//
exports.verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ message: 'Please enter your OTP', status: false });
        }

        if (Dotp !== otp) {
            vrOtpAttempts++;
            if (vrOtpAttempts >= 4) {
                vrOtpAttempts = 0;
                Dotp = null;
                return res.status(400).json({ message: 'OTP has expired! Please verify your email again.', status: false });
            }
            return res.status(400).json({ message: 'Incorrect OTP! Please try again.', status: false });
        }

        // OTP is correct, reset attempts and OTP
        vrOtpAttempts = 0;
        Dotp = null;

        // Create recruiter in the database
        const recruiterData = await RECRUITER.create(recruiter);

        if (recruiterData) {
            return res.status(200).json({ message: "Recruiter created successfully!", status: true, data: recruiterData });
        } else {
            return res.status(400).json({ message: "Recruiter creation failed! Please check your information.", status: false });
        }

    } catch (error) {
        console.error("Error in verifyOtp:", error);
        return res.status(500).json({ message: 'Internal Server Error', status: false });
    }
};


//------------------< GET ALL RECRUITER >------------------//
exports.getAllRecruiters = async (req, res) => {
    try {
        // Fetch recruiters by userId
        const recruiters = await RECRUITER.find({});
        // If no data found, return 404
        if (!recruiters.length === 0) {
            return res.status(404).json({ message: 'No data found for recruiters.' });
        }
        // Send successful response with recruiters
        return res.status(200).json({ message: 'Recruiters All finded', data: recruiters });
    } catch (error) {
        // Log the error and send a 500 status code
        console.error('Error fetching recruiters:', error);
        return res.status(500).json({ message: 'Failed to fetch recruiters. Please try again later.' });
    }
};

//------------------< GET ALL RECRUITER BY ADMIN >------------------//
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
        return res.status(200).json({ message: 'Recruiters created by admin', recruiters });
    } catch (error) {
        // Log the error and send a 500 status code
        console.error('Error fetching recruiters:', error);
        return res.status(500).json({ message: 'Failed to fetch recruiters. Please try again later.' });
    }
};

//------------------< LOGIN RECRUITER >------------------//
exports.recruiterLogin = async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({
            message: 'All fields are mandatory',
            status: false,
            data: null,
        });
    }
    try {
        const recruiter = await RECRUITER.findOne({ $or: [{ email: identifier }, { mobile: identifier }], });
        if (recruiter.status !== 1) {
            return res.status(200).json({ message: "Account Blocked ! Contact to Admin", status: false, data: null });
        }
        if (!recruiter) {
            return res.status(401).json({
                message: 'Invalid Email or Password',
                status: false,
                data: null,
            });
        }
        if (!recruiter || !(await bcrypt.compare(password, recruiter.password)) || recruiter.status !== 1) {
            return res.status(200).json({ message: "Invalid Id or Password !", status: false, data: null });
        }

        const accessToken = jwt.sign({
            user: {
                user_name: recruiter.user_name,
                email: recruiter.email,
                mobile: recruiter.mobile,
                id: recruiter._id,
            },
        }, config.ACCESS_TOKEN_SECRET, { expiresIn: '200m' });
        res.status(200).json({
            message: 'Login Successful',
            status: true,
            data: {
                accessToken,
                email: recruiter.email,
                mobile: recruiter.mobile,
                role: recruiter.role,
                details: recruiter,
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

//------------------< PROFILE RECRUITER >------------------//
exports.getProfile = async (req, res) => {
    try {
        const recruiterId = req.user?.id;
        console.log("recruiter id", recruiterId)
        const recruiter = await RECRUITER.findById(recruiterId);
        if (!recruiter) {
            return res.status(404).json({
                message: 'Admin not found',
                status: false,
                data: null,
            });
        }
        res.status(200).json({
            message: 'Profile fetched successfully',
            status: true,
            data: recruiter,
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

//------------------< UPDATE RECRUITER PROFILE >------------------//
exports.updatedProfile = async (req, res) => {
    try {
        const recruiterId = req.user?.id; // Get recruiter ID from request user
        if (!recruiterId) {
            return res.status(400).json({ message: "Recruiter ID is missing", status: false });
        }

        const {
            user_name, first_name, last_name, mobile, education, job_function, email, city, locality,
            pin_code, state, years, months, skills,
        } = req.body;

        const profileImage = req.file?.filename; // Optional chaining for file validation

        // Fetch recruiter by ID
        const recruiter = await RECRUITER.findById(recruiterId);

        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter not found", status: false });
        }

        // Update fields if provided, otherwise retain existing values
        recruiter.user_name = user_name || recruiter.user_name;
        recruiter.name.first_name = first_name || recruiter.name.first_name;
        recruiter.name.last_name = last_name || recruiter.name.last_name;
        recruiter.mobile = mobile || recruiter.mobile;
        recruiter.education = education || recruiter.education;
        recruiter.skills = skills || recruiter.skills;
        recruiter.email = email || recruiter.email;
        recruiter.job_function = job_function || recruiter.job_function;
        recruiter.current_location.city = city || recruiter.current_location.city;
        recruiter.current_location.locality = locality || recruiter.current_location.locality;
        recruiter.current_location.pin_code = pin_code || recruiter.current_location.pin_code;
        recruiter.current_location.state = state || recruiter.current_location.state;
        recruiter.experience.years = years || recruiter.experience.years;
        recruiter.experience.months = months || recruiter.experience.months;

        // Update profile image if provided
        if (profileImage) {
            recruiter.profileImage = profileImage;
        }

        // Save the updated profile to the database
        const updatedRecruiter = await recruiter.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            status: true,
            data: updatedRecruiter, // Return the updated recruiter object
        });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({
            message: 'Internal server error',
            status: false,
            data: null,
        });
    }
};
//------------------< UPDATE RECRUITER >------------------//
exports.updateRecruiter = async (req, res) => {
    try {
        const { id } = req.params; // Get recruiter ID from request user
        if (!id) {
            return res.status(400).json({ message: "Recruiter ID is missing", status: false });
        }

        const {
            user_name, first_name, last_name, mobile, education, gender, job_function, email, city, locality,
            pin_code, state, years, months, skills, description,
        } = req.body;

        const profileImage = req.file?.filename; // Optional chaining for file validation

        // Fetch recruiter by ID
        const recruiter = await RECRUITER.findById(id);

        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter not found", status: false });
        }

        // Update fields if provided, otherwise retain existing values
        recruiter.user_name = user_name || recruiter.user_name;
        recruiter.name.first_name = first_name || recruiter.name.first_name;
        recruiter.name.last_name = last_name || recruiter.name.last_name;
        recruiter.mobile = mobile || recruiter.mobile;
        recruiter.gender = gender || recruiter.gender;
        recruiter.education = education || recruiter.education;
        recruiter.skills = skills || recruiter.skills;
        recruiter.email = email || recruiter.email;
        recruiter.job_function = job_function || recruiter.job_function;
        recruiter.current_location.city = city || recruiter.current_location.city;
        recruiter.current_location.locality = locality || recruiter.current_location.locality;
        recruiter.current_location.pin_code = pin_code || recruiter.current_location.pin_code;
        recruiter.current_location.state = state || recruiter.current_location.state;
        recruiter.experience.years = years || recruiter.experience.years;
        recruiter.experience.months = months || recruiter.experience.months;
        recruiter.description = description || recruiter.description;

        // Update profile image if provided
        if (profileImage) {
            recruiter.profileImage = profileImage;
        }

        // Save the updated profile to the database
        const updatedRecruiter = await recruiter.save();

        res.status(200).json({
            message: 'Recruiter updated successfully',
            status: true,
            data: updatedRecruiter, // Return the updated recruiter object
        });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({
            message: 'Internal server error',
            status: false,
            data: null,
        });
    }
};
//------------------< DELETE RECRUITER >------------------//
exports.deleteRecruiter = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await RECRUITER.findByIdAndDelete(id);
        if (!data) {
            return res.status(404).json({ message: "Recruiter not found" });
        }
        return res.status(200).json({ message: "Data deleted Successfully!!!", data });
    } catch (err) {
        console.error("Error deleting recruiter data:", err.message);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

//------------------< SEND OTP RESET PASSWORD >------------------//
let virtualOtp = null;
let virtualid;
exports.sendOtpToResetPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.', status: false, data: null });
    }

    try {
        const userInfo = await RECRUITER.findOne({ email });

        if (!userInfo) {
            return res.status(404).json({ message: 'Email is not registered. Please sign up.', status: false, data: null });
        }
        virtualid = userInfo._id;
        const genOtp = generateOtp();
        virtualOtp = genOtp;

        await transporter.sendMail({
            from: config.EMAIL_FROM,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP is: ${genOtp} to reset your password.`
        });

        return res.status(200).json({ message: 'OTP sent to your email. Please check your inbox.', status: true, data: null });
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return res.status(500).json({ message: 'Internal server error.', status: false, data: null });
    }
};

//------------------< CHANGE PASSWORD OTP >------------------//
exports.changePasswordByOtp = async (req, res) => {
    try {
        let otpAttempts = 0;
        const { password, confirm_password, otp } = req.body;
        console.log(password, confirm_password, otp);
        if (!password || !confirm_password || !otp) {
            return res.status(400).json({ message: 'All fields are mandatory', status: false, data: null });
        }
        if (otpAttempts >= 3) {
            virtualOtp = null;
            return res.status(400).json({ message: 'Your OTP has expired', status: false, data: null });
        }
        if (virtualOtp !== otp) {
            otpAttempts++;
            return res.status(400).json({ message: 'OTP does not match. Please enter the correct OTP', status: false, data: null });
        }
        if (password !== confirm_password) {
            return res.status(400).json({ message: "Passwords do not match", status: false, data: null });
        }
        const newHashedPassword = await bcrypt.hash(password, 10);
        const update = { password: newHashedPassword };
        const updatedUser = await RECRUITER.findByIdAndUpdate(virtualid, update, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "Recruiter not found", status: false, data: null });
        }
        virtualOtp = null;
        otpAttempts = 0;
        return res.status(200).json({ message: "Password changed successfully", status: true, data: updatedUser });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: 'Internal Server Error', status: false, data: null });
    }
};

//------------------< CHANGE PASSWORD TOKEN >------------------//
exports.changePassword = async (req, res) => {
    try {
        const { password, confirm_password } = req.body;

        if (!password || !confirm_password) {
            res.status(200).json({ message: 'All fields are mandatory', status: false, data: null })
        } else {

            if (password != confirm_password) {
                res.status(200).json({ message: "Password and Confirm Password is not matched . Please Enter correct password !", status: false, data: false })
            } else {
                const newhashPassword = await bcrypt.hash(password, 10);
                console.log(req.user);
                console.log("Recruiterid: ", req.user.id);
                try {
                    const changeinfo = await RECRUITER.findByIdAndUpdate(req.user.id, { $set: { password: newhashPassword } });
                    console.log("changeinfo : ", changeinfo);
                    res.status(200).json({ message: "password changed succesfully", status: true, data: changeinfo })
                } catch (error) {
                    res.status(200).json({ message: "Recruiter not define Please SignUp !", status: false, data: null })
                }
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Some internal error !', status: false, data: null })
    }
};

//------------------< CHANGE PASSWORD TOKEN >------------------//
exports.singleRecruiter = async (req, res) => {
    const { id } = req.params;
    try {
        const recruiter = await RECRUITER.findById(id);
        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter not found" });
        }
        return res.status(200).json({ message: "Find Single data", data: recruiter });
    } catch (err) {
        console.error("Error fetching single recruiter:", err.message);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

//------------------< ACTIVE >------------------//
exports.activeRecruiter = async (req, res) => {
    try {
        const activeRecruiters = await RECRUITER.find({ status: 1 });
        if (activeRecruiters.length === 0) {
            return res.status(404).json({ message: "No active recruiters found", status: false, data: null });
        }
        return res.status(200).json({ message: "Active recruiters retrieved successfully", status: true, data: activeRecruiters });
    } catch (error) {
        console.error("Error in getactiveRecruiters:", error);
        return res.status(500).json({ message: "Internal Server Error", status: false, data: null });
    }
};

exports.makeInactiveRecruiter = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: "ID is required", status: false, data: null });
        }
        const recruiter = await RECRUITER.findById(id);
        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter does not exist with this ID", status: false, data: null });
        }
        const newStatus = recruiter.status === 1 ? 0 : 1;
        const updatedUser = await RECRUITER.findByIdAndUpdate(id, { status: newStatus }, { new: true });

        const statusMessage = newStatus === 1 ? "Active" : "Inactive";
        return res.status(200).json({ message: `Recruiter status set to ${statusMessage}.`, status: true, data: updatedUser });

    } catch (error) {
        console.error("Error in makeInactiveRecruiter:", error);
        return res.status(500).json({ message: "Internal Server Error", status: false, data: null });
    }
};

//-----------------< ALL INACTIVE RECRUITER >-----------------//
exports.getInactiveRecruiters = async (req, res) => {
    try {
        const inactiveRecruiters = await RECRUITER.find({ status: 0 });
        if (inactiveRecruiters.length === 0) {
            return res.status(404).json({ message: "No inactive recruiters found", status: false, data: null });
        }
        return res.status(200).json({ message: "Inactive recruiters retrieved successfully", status: true, data: inactiveRecruiters });
    } catch (error) {
        console.error("Error in getInactiveRecruiters:", error);
        return res.status(500).json({ message: "Internal Server Error", status: false, data: null });
    }
};

//-----------------< PENDING RECRUITER >-----------------//
exports.makePendingRecruiter = async (req, res) => {
    try {
        const { id } = req.body;
        const recruiter = await RECRUITER.findById(id);
        if (!recruiter) {
            return res.status(200).json({ message: "Recruiter does not exist with this ID", status: false, data: null });
        }
        const updateRecruiter = await RECRUITER.findByIdAndUpdate(id, { status: -1 });
        if (!updateRecruiter) {
            return res.status(200).json({ message: "Failed to update user status. Please try again.", status: false, data: null });
        }

        return res.status(200).json({ message: "Recruiter status set to pending.", status: true, data: updateRecruiter });
    } catch (error) {
        console.error("Error in makeInactivestatus:", error);
        return res.status(500).json({ message: "Internal Server Error", status: false, data: null });
    }
};
