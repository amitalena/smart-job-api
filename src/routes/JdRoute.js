const express = require("express");
const router = express.Router();
const jdControle = require('../controllers/JdController');
const validateToken = require("../middlewares/tokenHandlerMiddleware");

//------------------< ADMIN ROUTER >------------------//
router.post('/jd1/create', validateToken, jdControle.createJd);
router.get('/jd1/get-all-jd', jdControle.getJdByAdmin);
router.get('/jd1/get-single-jd/:id', jdControle.singleJd);
router.post('/jd1/update/:id', jdControle.updateJd);
router.delete('/jd1/delete/:id', jdControle.deleteJd);

module.exports = router;