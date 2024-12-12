const express = require("express");
const router = express.Router();
const validateToken = require('../middlewares/tokenHandlerMiddleware')
const applicationControle = require("../controllers/ApplicantController");
const resumeController = require('../controllers/ResumeController');
const upload = require('../middlewares/resumeMiddleware')

//------------------< ADMIN ROUTER >------------------//
router.post('/resume/upload', validateToken, upload.single('resume'), resumeController.uploadResume);
router.put('/resume/update', resumeController.updateResume);
router.get('/resume/get-all-resume', resumeController.getAllResumes);
router.delete('/resume/deleted', resumeController.deletedById);
router.post('/applicants/create', validateToken, applicationControle.createApplication);
router.get('/applicants/:userId', applicationControle.getApplicationsByUserId);
router.get('/applicants/get-all-applications', applicationControle.getAllApplications);
router.get('/applicants/get-single/:id', applicationControle.getApplicationById);
router.post('/applicants/:id', applicationControle.updateApplication);

module.exports = router;