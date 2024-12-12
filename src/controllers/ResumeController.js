const RESUME = require('../models/ResumeModel');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const PDFDocument = require('pdfkit'); // For generating new PDFs

// Helper function to clean up lines that start with numbers
function removeIfFirstNumber(arr) {
    return arr.filter((line, index) => {
        if (index === 0 || index === 1) return true;
        return !(line[0] >= '0' && line[0] <= '9');
    });
}

// Helper function to find the email from the resume text
function findEmail(arr) {
    return arr.find(line => line.includes('.com')) || '';
}

// Helper function to find the contact number from the resume text
function findContact(arr) {
    return arr.find(line => (line.includes('+91') || /^[0-9]{10,}$/.test(line))) || '';
}

// Function to generate a new PDF file with updated resume data
function generatePDF(resumeData) {
    const doc = new PDFDocument();
    const filePath = `./uploads/resumes/${resumeData.mail}.pdf`;

    try {
        doc.pipe(fs.createWriteStream(filePath));

        // Add resume content (customize this based on your design)
        doc.fontSize(20).text(resumeData.name, { align: 'center' });
        doc.fontSize(14).text(`Designation: ${resumeData.designation}`, { align: 'center' });
        doc.fontSize(14).text(`Email: ${resumeData.mail}`, { align: 'center' });
        doc.fontSize(14).text(`Contact: ${resumeData.contact}`, { align: 'center' });

        doc.end();
    } catch (err) {
        console.error('Error generating PDF:', err);
        throw err;
    }

    return filePath; // Return the path of the generated PDF
}

// Middleware to handle resume processing
exports.uploadResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path; // Expecting multer to provide this
    const rc1Id = req.user?.id;

    try {
        let dataBuffer;
        // Check if the file is stored on disk or in memory
        if (filePath) {
            dataBuffer = fs.readFileSync(filePath);
        } else if (req.file.buffer) {
            dataBuffer = req.file.buffer;
        } else {
            throw new Error('File data not available');
        }

        // Parse the PDF and extract the text
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;
        const keyValuePairs = text.split('\n').filter(line => line.trim() !== "");

        // Clean and extract required fields
        const cleanedKeyValuePairs = removeIfFirstNumber(keyValuePairs);
        const email = findEmail(cleanedKeyValuePairs);
        const contact = findContact(cleanedKeyValuePairs);

        const resumeData = {
            userId: rc1Id,
            name: cleanedKeyValuePairs[0] || 'N/A',
            designation: cleanedKeyValuePairs[1] || 'N/A',
            mail: email,
            contact: contact
        };

        // Check if the resume with the same email already exists
        const existingResume = await RESUME.findOne({ mail: email });
        if (existingResume) {
            return res.status(400).json({ message: "Email is already registered", Status: false, data: existingResume });
        }

        // Save the resume data to the database
        const newResume = new RESUME(resumeData);
        await newResume.save();

        res.status(200).json({ message: "Resume uploaded successfully", data: resumeData });
    } catch (err) {
        console.error('Error processing resume:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};

exports.updateResume = async (req, res) => {
    const { userId, name, designation, mail, contact } = req.body;
    try {
        const resume = await RESUME.findOne({ userId });
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        // Update resume data
        resume.name = name || resume.name;
        resume.designation = designation || resume.designation;
        resume.mail = mail || resume.mail;
        resume.contact = contact || resume.contact;

        // Save updated data to the database
        await resume.save();

        // Generate new PDF with updated data
        const newFilePath = generatePDF(resume);
        resume.pdfPath = newFilePath;

        // Return success response
        res.status(200).json({ message: "Resume updated successfully", data: resume });
    } catch (err) {
        console.error('Error updating resume:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};

//------------------< GET ALL RESUMES >------------------//
exports.getAllResumes = async (req, res) => {
    try {
        // Retrieve all resumes from the database
        const resumes = await RESUME.find({});
        // Check if there are any resumes found
        if (resumes.length === 0) {
            return res.status(404).json({ message: "No resumes found" });
        }
        res.status(200).json({ message: 'All Resumes retrieved successfully', resumes });
    } catch (err) {
        console.error('Error retrieving resumes:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};
exports.deletedById = async (req, res) => {
    const { id } = req.params;
    try {
        // Retrieve all resumes from the database
        const resumes = await RESUME.deletedById(id);
        // Check if there are any resumes found
        if (resumes.length === 0) {
            return res.status(404).json({ message: "No resumes found" });
        }
        res.status(200).json({ message: 'All Resumes retrieved successfully', resumes });
    } catch (err) {
        console.error('Error retrieving resumes:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};