const express = require("express");
const router = express.Router();
const candidateControle = require('../controllers/CandidateController');
const validateToken = require("../middlewares/tokenHandlerMiddleware");
const uploadFiles = require("../middlewares/uploadFilesMiddleware");


//------------------< ADMIN ROUTER >------------------//
router.post('/c1/register', uploadFiles, candidateControle.candidateRegister);
router.post('/c1/login', candidateControle.candidateLogin);
router.get('/c1/get-profile', validateToken, candidateControle.getCandidateProfile);
router.put('/c1/update/profile', uploadFiles, validateToken, candidateControle.updateCandidateProfile);
router.get('/c1/get-all-candidate', candidateControle.candidateGetAll);
router.patch('/c1/delete-account', validateToken, candidateControle.deleteCandidateAccount);
router.get('/c1/get-deleted-account', candidateControle.getDeletedAccounts);
router.delete('/c1/delete/:id', candidateControle.deleteCandidate);
router.get('/c1/get-single/:id', candidateControle.getCandidateById);

module.exports = router;