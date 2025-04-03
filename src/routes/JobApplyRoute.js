const express = require('express');
const router = express.Router();
const applicationControle = require('../controllers/JobApplyController');
const validateToken = require('../middlewares/tokenHandlerMiddleware');
const uploadFiles = require('../middlewares/uploadFilesMiddleware');


//------------------< APPLY ROUTER >------------------//
router.post('/apply/applications', validateToken, uploadFiles, applicationControle.applyForJob);
router.patch('/apply/applications/:id/status', validateToken, applicationControle.updateApplicationStatus);
router.get('/apply/:jobId/applications', applicationControle.getApplicationsByJobId);
router.get('/apply/applications', applicationControle.getAllApplyJob);
router.get('/apply/applications/:id', applicationControle.getApplicationDetails);
router.get('/applicant/applications/track-applications', validateToken, applicationControle.trackApplications);
router.patch('/applicant/applications/:id/read', validateToken, applicationControle.markAsRead);

module.exports = router;