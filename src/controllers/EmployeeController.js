const EMPLOYEE = require('../models/EmployeeModel');

//------------------< REGISTER EMPLOYEE >------------------//
exports.employeeRegister = async (req, res) => {
    try {
        const {
            first_name, last_name, gender, description, email, mobile, job_function, current_location, years, months, key_skills
        } = req.body;

        // Validate all required fields
        if (!first_name || !last_name || !gender || !description || !email || !mobile || !job_function || !current_location || !years || !months || !key_skills) {
            return res.status(400).json({ message: "All fields are mandatory", Status: false });
        }

        // Check if email is already registered
        const existingEmployee = await EMPLOYEE.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Email is already registered", Status: false });
        }
        const profileImage = req.files?.profileImage?.[0]?.filename || null;
        const resume = req.files?.resume?.[0]?.filename;
        // Prepare employee object
        const newEmployee = {
            name: {
                first_name,
                last_name
            },
            gender,
            email,
            mobile,
            job_function,
            current_location,
            experience: { years, months },
            key_skills,
            profileImage,
            resume,
            description
        };

        // Save the new employee
        const savedEmployee = await EMPLOYEE.create(newEmployee);

        return res.status(201).json({ message: 'Employee created successfully!', Status: true, data: savedEmployee });

    } catch (error) {
        console.error("Error in employeeRegister:", error.message);
        return res.status(500).json({ message: 'Internal Server Error', Status: false });
    }
};

//------------------< GET ALL EMPOLYEE >------------------//
exports.employeeGetAll = async (req, res) => {
    try {
        const employee = await EMPLOYEE.find({});
        return res.status(200).json({ message: "All Employee retrieved successfull! ", data: employee });
    } catch (err) {
        console.error("Error fetching data:", err.message);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};
//------------------< SINGLE EMPLOYEE >------------------//
exports.getSingleEmp = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await EMPLOYEE.findById(id);
        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found',
                status: false,
                data: null,
            });
        }
        res.status(200).json({
            message: 'Single data retrieved successfully',
            status: true,
            data: employee,
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
//------------------< UPDATE EMPLOYEE >------------------//
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params; // Assuming candidate ID is passed in the URL
        const { first_name, last_name, description, gender, email, mobile, job_function, current_location, years, months, key_skills } = req.body;

        // Find candidate by ID
        const candidate = await EMPLOYEE.findById(id);
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
        candidate.description = description || candidate.description;
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

//------------------< DELETE EMPLOYEE >------------------//
exports.deleteEmployee = async (req, res) => {
    const id = req.params.id;
    try {
        const contactus = await EMPLOYEE.findById(id);
        if (!contactus) {
            return res.status(404).json({ message: 'No data exists in contact database for this id', status: false, data: null });
        }

        const deletedata = await EMPLOYEE.findByIdAndDelete(id);
        if (!deletedata) {
            return res.status(404).json({ message: 'Failed to delete data from contact database for this id', status: false, data: null });
        }

        return res.status(200).json({ message: 'Data deleted successfully', status: true, data: contactus });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', status: false, data: null });
    }
};
