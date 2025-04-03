const express = require("express");
const router = express.Router();
const validateToken = require('../middlewares/tokenHandlerMiddleware');
const applicantControle = require('../controllers/ApplicantController');
const uploadFiles = require("../middlewares/uploadFilesMiddleware");


//------------------< ADMIN ROUTER >------------------//
router.post('/applicants/register', uploadFiles, applicantControle.createApplicant);
router.get('/applicants/profile', validateToken, applicantControle.getApplicantProfile);
router.put('/applicants/update', uploadFiles, validateToken, applicantControle.updateApplicantProfile);
router.get('/applicants/get-all-applicants', applicantControle.getAllApplicant);
router.get('/applicants/get-single/:id', applicantControle.getApplicantById);
router.post('/applicants/login', applicantControle.loginApplicant);
router.delete('/applicants/delete/:id', applicantControle.deleteApplicant);
router.patch('/applicants/delete-account', validateToken, applicantControle.deleteApplicantAccount);
router.get('/applicants/get-deleted-account', applicantControle.getDeletedAccounts);
router.get('/applicants/track-applications', validateToken, applicantControle.trackApplications);

module.exports = router;