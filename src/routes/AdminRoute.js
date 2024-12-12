const express = require("express");
const router = express.Router();
const adminControle = require('../controllers/AdminController');
const upload = require('../middlewares/uploadImageMiddleware');
const validateToken = require("../middlewares/tokenHandlerMiddleware");

//------------------< ADMIN ROUTER >------------------//
router.post('/admin/create', upload.single('profileImage'), adminControle.createAdmin);
router.post('/admin/login', adminControle.loginAdmin);
router.put("/admin/profile-update", upload.single('profileImage'), validateToken, adminControle.updateProfile);
router.get('/admin/profile', validateToken, adminControle.getProfile);

//------------------< CREATE BY ADMIN >------------------//
router.post('/admin/send-jd-emails', adminControle.sendMultipleEmails);
router.get('/admin/recruiters/:adminId', adminControle.getRecruitersByAdmin);
router.delete('/admin/recruiters/account', validateToken, adminControle.deleteRecruiterAccount);
router.get('/admin/jobs/:adminId', adminControle.getJdByAdmin);
module.exports = router;