const express = require("express");
const router = express.Router();
const resumeController = require('../controllers/ResumeController');
const validateToken = require("../middlewares/tokenHandlerMiddleware");
const upload = require("../middlewares/resumeMiddleware");

//------------------< ADMIN ROUTER >------------------//
router.post('/resume/upload', validateToken, upload.single('resume'), resumeController.uploadResume);
// router.put('/resume/update', validateToken, resumeController.updateResume);
router.get('/resume/get-all-resume', validateToken, resumeController.getAllResumes);
router.delete('/resume/delete/:id', validateToken, resumeController.deletedById)

module.exports = router;