const express = require('express');
const {
    createCustomResume,
    getAllCustomResumes,
    getCustomResumeById,
    updateCustomResume,
    deleteCustomResume,
} = require('../controllers/ResumeCustomController');
const uploadFiles = require('../middlewares/uploadFilesMiddleware');
const validateToken = require('../middlewares/tokenHandlerMiddleware');

const router = express.Router();

// Routes
router.post('/custom/r1/create', uploadFiles, validateToken, createCustomResume); // Create a new resume
router.get('/custom/r1/all-resumes', getAllCustomResumes); // Get all resumes
router.get('/custom/r1/single-resume/:id', getCustomResumeById); // Get a single resume by ID
router.put('/custom/r1/update/:id', updateCustomResume); // Update a resume by ID
router.delete('/custom/r1/delete/:id', deleteCustomResume); // Delete a resume by ID

module.exports = router;
