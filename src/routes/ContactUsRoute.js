const express = require('express');
const router = express.Router();
const contactusController = require('../controllers/ContactUsController');
const validateToken = require('../middlewares/tokenHandlerMiddleware');

router.post('/contactus/send', validateToken, contactusController.submitContact)
router.get('/contactus/all-contactus', contactusController.getAllContact)
router.get('/contactus/single/:id', contactusController.getSingleContact)
router.delete('/contactus/delete/:id', contactusController.deleteContact)

module.exports = router