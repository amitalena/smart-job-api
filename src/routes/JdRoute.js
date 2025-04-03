const express = require("express");
const router = express.Router();
const jdControle = require('../controllers/JdController');
const validateToken = require("../middlewares/tokenHandlerMiddleware");

//------------------< ADMIN ROUTER >------------------//
router.post('/jd1/create', validateToken, jdControle.createJobDescription);
router.get('/jd1/get-all-jd', jdControle.getAllJobDescriptions);
router.get('/jd1/get-single-jd/:id', jdControle.getJobDescriptionById);
router.get('/jd1/search', jdControle.searchJobDescription);
router.get('/jd1/pagination', jdControle.paginationJobDescription);
router.put('/jd1/update/:id', jdControle.updateJobDescription);
router.delete('/jd1/delete/:id', jdControle.deleteJobDescription);
router.get('/jd1/category/:categoryId', jdControle.getJobsByCategory);


module.exports = router;