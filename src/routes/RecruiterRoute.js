const express = require("express");
const router = express.Router();
const recruiterControle = require('../controllers/RecruiterController');
const upload = require('../middlewares/uploadImageMiddleware');
const validateToken = require('../middlewares/tokenHandlerMiddleware')

//------------------< RECRUITER ROUTER >------------------//
router.post('/rc1/create', validateToken, upload.single('profileImage'), recruiterControle.createRecruiter)
router.post('/rc1/verify-otp', recruiterControle.verifyOtp);
router.get('/rc1/profile', validateToken, recruiterControle.getProfile);
router.put("/rc1/profile-update", upload.single('profileImage'), validateToken, recruiterControle.updatedProfile);
router.get('/rc1/get-all-recruiters', recruiterControle.getAllRecruiters);
router.delete('/rc1/delete/:id', recruiterControle.deleteRecruiter);
router.post('/rc1/login', recruiterControle.recruiterLogin);
router.get('/rc1/single-recruiter/:id', recruiterControle.singleRecruiter);
router.post('/rc1/inactive-recruiter', recruiterControle.makeInactiveRecruiter);
router.get('/rc1/all-active-recruiters', recruiterControle.activeRecruiter);
router.get('/rc1/all-inactive-recruiter', recruiterControle.getInactiveRecruiters);
router.post('/rc1/otp-reset-password', recruiterControle.sendOtpToResetPassword);
router.post('/rc1/change-password-otp', recruiterControle.changePasswordByOtp);
router.post('/rc1/change-password-token', validateToken, recruiterControle.changePassword);
router.delete('/rc1/account', validateToken, recruiterControle.deleteAccount);

// router.post('/rc1/send-otp-email', recruiterControle.resendOtp);
// router.post('/rc1/resend-otp', recruiterControle.resendOtp);

module.exports = router;