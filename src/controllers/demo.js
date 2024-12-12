
const RECRUITER = require('../models/RecruiterModel');
const transporter = require('../../CONFIG/emailConfig');
const generateOtp = require('./generateOTP');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');

//------------------< INITIALIZE RECRUITER >------------------//
let Dotp = null;
let imageUploading = false;
let vrOtpAttempts = 0;
let recruiter = {
    name: {
        first_name: null,
        last_name: null
    },
    gender: null,
    email: null,
    mobile: null,
    role: null,
    status: null,
    education: null,
    experience: {
        years: null,
        months: null
    },
    skills: null,
    current_location: {
        pin_code: null,
        locality: null,
        city: null,
        state: null,
    },
    password: null,
    confirm_password: null,
    profileImage: null
}

//------------------< CREATE RECRUITER >------------------//
exports.createRecruiter = async (req, res) => {
    const adminId = req.user?.id;
    console.log('Image file:', req.file);
    console.log('Request body:', req.body);

    try {
        const {
            first_name, last_name, role, mobile, education, gender, email, city, locality,
            pin_code, state, years, months, skills, password, confirm_password
        } = req.body;

        if (!first_name || !last_name || !role || !mobile || !education || !gender || !email || !city ||
            !locality || !pin_code || !state || !years || !months || !skills || !password || !confirm_password) {
            return res.status(400).json({ message: "All fields are mandatory", Status: false });
        }

        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Passwords do not match', Status: false });
        }

        const existingRecruiter = await RECRUITER.findOne({ email });

        if (existingRecruiter) {
            return res.status(400).json({ message: "Email is already registered", Status: false, data: existingRecruiter });
        }

        recruiter = {
            userId: adminId,
            name: { first_name, last_name },
            mobile,
            role,
            gender,
            education,
            skills,
            email,
            current_location: { city, locality, pin_code, state },
            experience: { years, months },
            password,
            confirm_password
        };

        if (req.file) {
            recruiter.profileImage = req.file.filename;
            imageUploading = true;
        } else {
            recruiter.profileImage = "not available";
            imageUploading = false;
        }

        // Generate OTP and send email
        Dotp = generateOtp();
        await transporter.sendMail({
            from: config.EMAIL_FROM,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP is: ${Dotp} to verify your email`
        });

        return res.status(200).json({ message: 'OTP sent to email! Please verify your email.', Status: true });

    } catch (error) {
        console.error("Error in createRecruiter:", error);
        return res.status(500).json({ message: 'Internal Server Error', Status: false });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const email = recruiter.email;

        // Debug: Log the email
        console.log('Email:', email);
        // Generate a new OTP
        const newOtp = generateOtp(); // Ensure this function returns a string

        // Send the OTP via email
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || config.EMAIL_FROM,
            to: email,
            subject: "Your OTP Code",
            text: `Your new OTP is: ${newOtp}`
        });

        console.log(`Email sent: ${info.messageId}`); // Log the success response

        return res.status(200).json({ message: 'OTP has been resent successfully.', Status: true });
    } catch (error) {
        console.error('Error in resendOtp:', error); // Log the error for debugging
        return res.status(500).json({ message: 'Internal Server Error.', Status: false });
    }
};
//------------------< VERIFY OTP RECRUITER >------------------//
exports.verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        vrOtpAttempts++;

        if (!otp) {
            return res.status(400).json({ message: 'Please enter your OTP', Status: false });
        }

        if (Dotp !== otp) {
            if (vrOtpAttempts >= 4) {
                vrOtpAttempts = 0;
                Dotp = null;
                return res.status(400).json({ message: 'OTP has expired! Please verify your email again.', Status: false });
            }
            return res.status(400).json({ message: 'Incorrect OTP! Please try again.', Status: false });
        }

        // OTP is correct, reset attempts
        vrOtpAttempts = 0;
        Dotp = null;

        // Hash password
        const hashedPassword = await bcrypt.hash(recruiter.password, 10);
        recruiter.password = hashedPassword;
        recruiter.confirm_password = hashedPassword;

        // Create recruiter in the database
        const createdData = await RECRUITER.create(recruiter);

        if (createdData) {
            return res.status(200).json({ message: "User created successfully!", Status: true, data: createdData });
        } else {
            return res.status(400).json({ message: "User creation failed! Please check your information.", Status: false });
        }

    } catch (error) {
        console.error("Error in verifyOtp:", error);
        return res.status(500).json({ message: 'Internal Server Error', Status: false });
    }
};

//------------------< GET ALL RECRUITER >------------------//
exports.readRecruiter = async (req, res) => {
    try {
        const data = await RECRUITER.find({});
        return res.status(200).json({ message: "Recruiter All Data", data });
    } catch (err) {
        console.error("Error fetching data:", err.message);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

//------------------< UPDATE RECRUITER >------------------//
exports.updateRecruiter = async (req, res) => {
    const { name, email, role, current_location, mobile, password } = req.body;
    const updatedData = {};

    try {
        // Set up the fields to be updated
        if (name && (name.first_name || name.last_name)) {
            updatedData.name = {
                first_name: name.first_name || "",
                last_name: name.last_name || "",
            };
        }

        if (email) updatedData.email = email;
        if (role) updatedData.role = role;

        if (current_location) {
            updatedData.current_location = {
                city: current_location.city || "",
                locality: current_location.locality || "",
                pin_code: current_location.pin_code ? parseInt(current_location.pin_code, 10) : null,
                state: current_location.state || "",
            };
        }

        if (mobile) updatedData.mobile = parseInt(mobile, 10);

        if (req.file && req.file.filename) {
            updatedData.profileImage = req.file.filename;
        }

        if (password) {
            updatedData.password = await bcrypt.hash(password, 10);
        }

        // Check if any field has been set for update
        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ message: "No data provided for update", status: false });
        }

        // Update the recruiter information
        const recruiterUpdate = await RECRUITER.findByIdAndUpdate(req.user?.id, updatedData, { new: true });

        if (!recruiterUpdate) {
            return res.status(404).json({ message: "Recruiter not found", status: false });
        }

        return res.status(200).json({ message: "Recruiter updated successfully!!!", status: true, data: recruiterUpdate });
    } catch (err) {
        console.error("Error updating recruiter:", err.message);
        return res.status(500).json({ message: "Internal server error", status: false, error: err.message });
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

//---------------------< LOGIN RECRUITER >-----------------------//
exports.loginRecruiter = async (req, res) => {
    const { email, password } = req.body;

    // Check for missing fields
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and Password are required",
            status: false,
            data: null
        });
    }

    try {
        // Find recruiter by email
        const recruiter = await RECRUITER.findOne({ email });

        // If recruiter is not found or password is incorrect
        if (!recruiter || !(await bcrypt.compare(password, recruiter.password))) {
            return res.status(400).json({
                message: "Invalid Email or Password",
                status: false,
                data: null
            });
        }

        // Check if recruiter account is blocked
        if (recruiter.status !== 1) {
            return res.status(403).json({
                message: "Account Blocked! Please contact the Admin.",
                status: false,
                data: null
            });
        }

        // Generate access token
        const accessToken = jwt.sign(
            {
                user: {
                    user_name: recruiter.user_name,
                    email: recruiter.email,
                    id: recruiter._id
                }
            },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: "200m" }
        );

        // Respond with success
        return res.status(200).json({
            message: 'Login Successful',
            status: true,
            data: {
                accessToken,
                email: recruiter.email,
                role: recruiter.role,
                details: recruiter
            }
        });
    } catch (error) {
        // Log error and return server error response
        console.error('Error during login:', error);
        return res.status(500).json({
            message: "Internal Server Error",
            status: false,
            data: null
        });
    }
};

//------------------< SEND OTP RESET PASSWORD >------------------//
let virtualOtp = null;
let virtualid;
exports.sendOtpToResetPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.', Status: false, data: null });
    }

    try {
        const userInfo = await RECRUITER.findOne({ email });

        if (!userInfo) {
            return res.status(404).json({ message: 'Email is not registered. Please sign up.', Status: false, data: null });
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

        return res.status(200).json({ message: 'OTP sent to your email. Please check your inbox.', Status: true, data: null });
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return res.status(500).json({ message: 'Internal server error.', Status: false, data: null });
    }
};

//------------------< CHANGE PASSWORD OTP >------------------//
exports.changePasswordByOtp = async (req, res) => {
    try {
        let otpAttempts = 0;
        const { password, confirm_password, otp } = req.body;
        console.log(password, confirm_password, otp);
        if (!password || !confirm_password || !otp) {
            return res.status(400).json({ message: 'All fields are mandatory', Status: false, data: null });
        }
        if (otpAttempts >= 3) {
            virtualOtp = null;
            return res.status(400).json({ message: 'Your OTP has expired', Status: false, data: null });
        }
        if (virtualOtp !== otp) {
            otpAttempts++;
            return res.status(400).json({ message: 'OTP does not match. Please enter the correct OTP', Status: false, data: null });
        }
        if (password !== confirm_password) {
            return res.status(400).json({ message: "Passwords do not match", Status: false, data: null });
        }
        const newHashedPassword = await bcrypt.hash(password, 10);
        const update = { password: newHashedPassword };
        const updatedUser = await RECRUITER.findByIdAndUpdate(virtualid, update, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "Recruiter not found", Status: false, data: null });
        }
        virtualOtp = null;
        otpAttempts = 0;
        return res.status(200).json({ message: "Password changed successfully", Status: true, data: updatedUser });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: 'Internal Server Error', Status: false, data: null });
    }
};

//------------------< CHANGE PASSWORD TOKEN >------------------//
exports.changePassword = async (req, res) => {
    try {
        const { password, confirm_password } = req.body;

        if (!password || !confirm_password) {
            res.status(200).json({ message: 'All fields are mandatory', Status: false, data: null })
        } else {

            if (password != confirm_password) {
                res.status(200).json({ message: "Password and Confirm Password is not matched . Please Enter correct password !", Status: false, data: false })
            } else {
                const newhashPassword = await bcrypt.hash(password, 10);
                console.log(req.user);
                console.log("userid: ", req.user.id);
                try {
                    const changeinfo = await RECRUITER.findByIdAndUpdate(req.user.id, { $set: { password: newhashPassword } });
                    console.log("changeinfo : ", changeinfo);
                    res.status(200).json({ message: "password changed succesfully", Status: true, data: changeinfo })
                } catch (error) {
                    res.status(200).json({ message: "User not define Please SignUp !", Status: false, data: null })
                }
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Some internal error !', Status: false, data: null })
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
        return res.status(200).json({ message: "Find Single data", recruiter });
    } catch (err) {
        console.error("Error fetching single recruiter:", err.message);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

// exports.sendOtpEmail = async (req, res) => {
//     try {
//         const otp = generateOtp();
//         otpStore[email] = otp;

//         // Create a transporter for sending email
//         const transporter = nodemailer.createTransport({
//             service: 'Gmail',
//             auth: {
//                 user: 'your-email@gmail.com',
//                 pass: 'your-email-password'
//             }
//         });

//         // Send OTP email
//         await transporter.sendMail({
//             from: config.EMAIL_FROM,
//             to: email,
//             subject: 'Your OTP Code',
//             text: `Your OTP code is ${otp}`
//         });

//         res.json({ Status: true, message: 'OTP sent successfully' });
//     } catch (error) {
//         console.error('Error sending OTP:', error);
//         res.status(500).json({ Status: false, message: 'Failed to send OTP' });
//     }
// };
//------------------< RESEND OTP >------------------//



//------------------< ACTIVE >------------------//
exports.activeRecruiter = async (req, res) => {
    var email = req.user?.email
    console.log(email)
    try {
        const active = await RECRUITER.findOne({ email })
        if (!active) {
            res.status(200).json({ message: "Recruiter is not Registered", Status: false, data: null })
        }
        else {

            res.status(200).json({ message: 'Active Recruiter', data: active, Status: true })
        }
    } catch (error) {
        res.status(500).json({ message: 'Some internal error ', data: active, Status: true })
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
        console.error("Error in makeInactiveStatus:", error);
        return res.status(500).json({ message: "Internal Server Error", status: false, data: null });
    }
};

//-----------------< LOGOUT >-----------------//
exports.recruiterLogout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ error: 'Server error' });
        } else {
            res.json({ message: 'Logout successfull!!!' });
        }
    });
};

//------------------< DELETE ACCOUNT >------------------//
exports.deleteAccount = async (req, res) => {
    const { email } = req.body;
    req.user.id;
    await RECRUITER.deleteOne({ email })
    res.status(200).json({ message: "Deleted succesfully" })
}





exports.createApplication = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User not authenticated" });
        }

        const {
            name,
            email,
            designation,
            contact,
            address,
            full_address,
            dob,
            gender,
            total_experience,
            relevant_experience,
            current_company
        } = req.body;

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
        const newApplication = await APPLICATION.create({
            userId: userId,
            name,
            email,
            designation,
            contact,
            address,
            full_address,
            dob,
            gender,
            total_experience,
            relevant_experience,
            current_company
        });

        // Respond with success
        return res.status(200).json({
            message: "Application created successfully",
            Status: true,
            data: newApplication
        });

    } catch (error) {
        console.error("Error creating application:", error);
        return res.status(500).json({
            message: "Internal server error",
            Status: false,
            error: error.message
        });
    }
};