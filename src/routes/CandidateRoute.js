const express = require("express");
const router = express.Router();
const candidateControle = require('../controllers/CandidateController');
const validateToken = require("../middlewares/tokenHandlerMiddleware");
const uploadFiles = require("../middlewares/uploadFilesMiddleware");


//------------------< ADMIN ROUTER >------------------//
router.post('/candidate/upload', uploadFiles, candidateControle.candidateRegister);
router.post('/candidate/login', candidateControle.candidateLogin);
router.get('/candidate/profile', validateToken, candidateControle.getCandidateProfile);
router.post('/candidate/logout', candidateControle.candidateLogout);
router.get('/candidate/get-all-candidate', candidateControle.candidateGetAll);
router.patch('/candidate/delete-account/:id', validateToken, candidateControle.deleteCandidateAccount);
router.get('/candidate/get-deleted-account', validateToken, candidateControle.getDeletedAccounts);
router.put('/candidate/update', uploadFiles, validateToken, candidateControle.updateCandidateProfile);
router.put('/candidate/update/:id', candidateControle.updateCandidate);

module.exports = router;