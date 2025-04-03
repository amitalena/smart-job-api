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
        const { user_name, first_name, last_name, email, mobile, password, description } = req.body;

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
            description,
            password: hashedPassword
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
// exports.loginAdmin = async (req, res) => {
//     const { email, password } = req.body;
//     if (!email || !password) {
//         return res.status(400).json({
//             message: 'All fields are mandatory',
//             status: false,
//             data: null,
//         });
//     }
//     try {
//         const admin = await ADMIN.findOne({ email });
//         if (!admin) {
//             return res.status(401).json({
//                 message: 'Invalid Email or Password',
//                 status: false,
//                 data: null,
//             });
//         }
//         const isPasswordValid = await bcrypt.compare(password, admin.password);
//         console.log("password of admin", isPasswordValid)
//         if (!isPasswordValid) {
//             return res.status(401).json({
//                 message: 'Invalid Email or Password',
//                 status: false,
//                 data: null,
//             });
//         }
//         const accessToken = jwt.sign({
//             user: {
//                 user_name: admin.user_name,
//                 email: admin.email,
//                 id: admin._id,
//             },
//         }, config.ACCESS_TOKEN_SECRET, { expiresIn: '200m' });
//         res.status(200).json({
//             message: 'Login Successful',
//             status: true,
//             data: {
//                 accessToken,
//                 email: admin.email,
//                 role: admin.role,
//                 details: admin,
//             },
//         });
//     } catch (error) {
//         console.error('Error logging in:', error.message);
//         res.status(500).json({
//             message: 'Internal server error',
//             status: false,
//             data: null,
//         });
//     }
// };

exports.loginAdmin = async (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or mobile number
    if (!identifier || !password) {
        return res.status(400).json({
            message: 'All fields are mandatory',
            status: false,
            data: null,
        });
    }

    try {
        // Search for admin by email or mobile number
        const admin = await ADMIN.findOne({
            $or: [{ email: identifier }, { mobile: identifier }],
        });

        if (!admin) {
            return res.status(401).json({
                message: 'Invalid Email/Mobile Number or Password',
                status: false,
                data: null,
            });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid Email/Mobile Number or Password',
                status: false,
                data: null,
            });
        }

        // Generate JWT token
        const accessToken = jwt.sign(
            {
                user: {
                    user_name: admin.user_name,
                    email: admin.email,
                    mobile: admin.mobile,
                    id: admin._id,
                },
            },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: '200m' }
        );

        // Respond with success
        res.status(200).json({
            message: 'Login Successful',
            status: true,
            data: {
                accessToken,
                email: admin.email,
                mobile: admin.mobile,
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

//------------------< DELETE ACCOUNT >------------------//
exports.deleteAccount = async (req, res) => {
    try {
        const adminId = req.user?.id;
        const deletedAdmin = await ADMIN.findByIdAndDelete(adminId);

        if (!deletedAdmin) {
            return res.status(404).json({ message: 'Admin not found', status: false, data: null, });
        }
        res.status(200).json({ message: 'Account deleted successfully', status: true, data: null, });
    } catch (error) {
        console.error('Error deleting account:', error.message);
        res.status(500).json({ message: 'Internal server error', status: false, data: null, });
    }
};

//------------------< JD BY ADMIN >------------------//
exports.getJdByAdmin = async (req, res) => {
    const adminId = req.user?.id;
    try {
        // Fetch jd by userId
        const jobs = await JOBDESCRIPTION.find({ adminId }).populate('userId', 'user_name email role');
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
        const recruiters = await RECRUITER.find({ recruiterId }).populate('userId', 'user_name email role');

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

// exports.sendMultipleEmails = async (req, res) => {
//     try {
//         const { first_name: adminFirstName, last_name: adminLastName, mobile: adminMobile, email: adminEmail } = req.user || {};
//         const { emails: emailAddresses, job_title, company_name, qualification, job_function, salary } = req.body;

//         if (!emailAddresses || !Array.isArray(emailAddresses) || emailAddresses.length === 0) {
//             return res.status(400).json({ message: "No email addresses provided" });
//         }

//         // Email HTML template
//         const emailHTML = `
//             <div style="font-size: 11px; background-color: #fdfdfd; padding: 15px; border-radius: 10px; max-width: 600px; font-family: Arial, sans-serif;">
//                 <h6 style="color:rgb(9, 37, 145); font-weight: bold; margin-bottom: 16px;">
//                     Subject: Exciting Job Opportunity: ${job_title} at ${company_name}
//                 </h6>

//                 <p>Dear <b>${first_name} ${last_name}</b>,</p>

//                 <p style="margin-bottom: 16px;">
//                     I hope this message finds you well. I am excited to share an incredible job opportunity that could
//                     be a great fit for you or someone in your network.
//                 </p>

//                 <p style="font-weight: bold; margin-bottom: 8px;">
//                     Here are the key details about the role:
//                 </p>

//                 <div style="margin-bottom: 16px;">
//                     <p><strong>Job Title:</strong> ${job_title}</p>
//                     <p><strong>Company:</strong> ${company_name}</p>
//                     <p><strong>Qualification:</strong> ${qualification}</p>
//                     <p><strong>Job Function:</strong> ${job_function}</p>
//                     <p><strong>Salary:</strong> ₹${salary?.s_min || "N/A"} - ₹${salary?.s_max || "N/A"}</p>
//                 </div>

//                 <p style="margin-bottom: 16px;">
//                     We are looking for a motivated individual who is ready to contribute to ${company_name}’s success
//                     and take on challenging and rewarding projects.
//                 </p>

//                 <p style="margin-bottom: 16px;">
//                     If you are interested in exploring this opportunity further, please reply to this email or contact
//                     us at ${adminMobile}. Feel free to share this information with anyone who might be interested.
//                 </p>

//                 <p>
//                     Looking forward to hearing from you!
//                 </p>

//                 <p style="margin-top: 24px; font-weight: bold;">
//                     Best regards,<br />
//                     ${adminFirstName} ${adminLastName}<br />
//                     ${adminMobile}
//                      ${adminEmail}
//                 </p>
//             </div>
//         `;
//         const emailStatus = [];

//         // Use `Promise.all` for parallel email sending
//         await Promise.all(
//             emailAddresses.map(async (email) => {
//                 try {
//                     await transporter.sendMail({
//                         from: config.EMAIL_FROM,
//                         to: email,
//                         subject: `Exciting Job Opportunity: ${job_title} at ${company_name}`,
//                         html: emailHTML,
//                     });
//                     emailStatus.push({ email, status: "Success" });
//                 } catch (error) {
//                     emailStatus.push({ email, status: "Failed", error: error.message });
//                 }
//             })
//         );

//         // Send response
//         res.status(200).json({ message: "Emails processed", status: emailStatus });
//     } catch (error) {
//         console.error("Error sending multiple emails:", error);
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// };
