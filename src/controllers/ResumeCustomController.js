const CUSTOMRESUME = require('../models/ResumeCustomModel');

// const createCustomResume = async (req, res) => {
//     const applicantId = req.user?.id;
//     try {
//         const {
//             name,
//             designation,
//             email,
//             mobile,
//             linkedin,
//             github,
//             professionalSummary,
//             skills,
//             currentEmployee,
//             employeeType,
//             years,
//             months,
//             currentCompany,
//             currentCompanyAddress,
//             jobTitle,
//             degree,
//             institution,
//             startYear,
//             endYear,
//             grade,
//             title,
//             company,
//             duration,
//             responsibilities,
//             projectName,
//             projectDesignation,
//             technologies,
//             certifications,
//             achievements,
//             extracurricularActivities,
//             referenceName,
//             referenceContact,
//             referenceRelation,
//             onlineProfileLink,
//             workSample,
//             certificationTitle,
//             personal,
//             dob,
//             categories,
//             parmanentAddress,
//         } = req.body;

//         // Validate required fields (Optional: Additional validation logic can be added)
//         if (!applicantId || !header || !professionalSummary) {
//             return res.status(400).json({ message: 'Required fields are missing!' });
//         }

//         // Create a new CustomResume document
//         const newResume = new CUSTOMRESUME({
//             applicantId,
//             header: {
//                 name,
//                 designation,
//                 contact: {
//                     email,
//                     mobile,
//                     linkedin,
//                     github,
//                 },
//             },
//             professionalSummary,
//             skills,
//             employeement: {
//                 currentEmployee: {
//                     currentCompany,
//                     currentCompanyAddress,
//                     currentDesignation,
//                     currentCompanyContact: {
//                         email,
//                         mobile,
//                     },
//                     previousCompanyDuration: {
//                         years,
//                         months
//                     }
//                 },
//                 previousEmployment: {
//                     previousCompany,
//                     previousCompanyAddress,
//                     previousDesignation,
//                     previousCompanyContact: {
//                         email,
//                         mobile,
//                     },
//                     previousCompanyDuration: {
//                         years,
//                         months
//                     }
//                 }
//             },
//             education: {
//                 degree,
//                 institution,
//                 startYear,
//                 endYear,
//                 grade,
//             },

//             workExperience: {
//                 title,
//                 company,
//                 designation,
//                 duration: {
//                     durationYear,
//                     durationMonth
//                 },
//             },
//             projects: {
//                 projectName,
//                 projectDescription,
//                 technologies,
//             },
//             certifications,
//             achievements,
//             extracurricularActivities,
//             references: {
//                 referenceName,
//                 referenceContact,
//                 referenceRelation,
//             },
//             accompliment: {
//                 onlineProfileLink,
//                 workSample,
//                 certificationTitle
//             },
//             personalDetails: {
//                 personal,
//                 dob,
//                 categories,
//                 permanentAddress
//             },
//         });

//         // Save to database
//         const savedResume = await newResume.save();

//         res.status(201).json({
//             message: 'Custom resume created successfully!',
//             data: savedResume,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error creating custom resume', error });
//     }
// };

const createCustomResume = async (req, res) => {
    const applicantId = req.user?.id;
    try {
        const {
            header,
            professionalSummary,
            skills,
            employeement,
            education,
            workExperience,
            projects,
            certifications,
            achievements,
            extracurricularActivities,
            references,
            accompliment,
            personalDetails,
        } = req.body;

        // Validate required fields
        if (!applicantId || !header || !professionalSummary) {
            return res.status(400).json({ message: 'Required fields are missing!' });
        }
        const resume = req.files?.resume?.[0]?.filename;
        // Create a new resume document
        const newResume = new CUSTOMRESUME({
            applicantId,
            header,
            resume,
            professionalSummary,
            skills,
            employeement,
            education,
            workExperience,
            projects,
            certifications,
            achievements,
            extracurricularActivities,
            references,
            accompliment,
            personalDetails,
        });

        // Save to database
        const savedResume = await newResume.save();

        res.status(201).json({
            message: 'Custom resume created successfully!',
            data: savedResume,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating custom resume', error });
    }
};
// Get all Custom Resumes
const getAllCustomResumes = async (req, res) => {
    try {
        const resumes = await CUSTOMRESUME.find().populate('applicantId', 'name first_name last_name email');
        res.status(200).json({ message: "All resumes retrieved successfull!", status: true, data: resumes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching resumes', error });
    }
};

// Get a single Custom Resume by ID
const getCustomResumeById = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await CUSTOMRESUME.findById(id).populate('applicantId');
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(200).json({ message: "Single resume retrieved successfull!", status: true, data: resume });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching resume', error });
    }
};

// Update a Custom Resume
const updateCustomResume = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedResume = await CUSTOMRESUME.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedResume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(200).json({ message: 'Resume updated successfully', data: updatedResume });
    } catch (error) {
        res.status(500).json({ message: 'Error updating resume', error });
    }
};

// Delete a Custom Resume
const deleteCustomResume = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedResume = await CUSTOMRESUME.findByIdAndDelete(id);
        if (!deletedResume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting resume', error });
    }
};

module.exports = {
    createCustomResume,
    getAllCustomResumes,
    getCustomResumeById,
    updateCustomResume,
    deleteCustomResume,
};
