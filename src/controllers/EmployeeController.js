const EMPLOYEE = require('../models/EmployeeModel');

//------------------< REGISTER EMPLOYEE >------------------//
exports.employeeRegister = async (req, res) => {
    try {
        const {
            first_name, last_name, email, mobile, job_function, current_location, years, months, key_skills
        } = req.body;

        // Validate all required fields
        if (!first_name || !last_name || !email || !mobile || !job_function || !current_location || !years || !months || !key_skills) {
            return res.status(400).json({ message: "All fields are mandatory", Status: false });
        }

        // Check if email is already registered
        const existingEmployee = await EMPLOYEE.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Email is already registered", Status: false });
        }

        // Prepare employee object
        const newEmployee = {
            name: {
                first_name,
                last_name
            },
            email,
            mobile,
            job_function,
            current_location,
            experience: { years, months },
            key_skills,
            employeeImage: req.file ? req.file.filename : "not available"
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
        return res.status(200).json({ message: "Employee All Data", data: employee });
    } catch (err) {
        console.error("Error fetching data:", err.message);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};