const express = require('express');
const router = express.Router();
const contactusController = require('../controllers/ContactUsController')

router.post('/contact/create', contactusController.createContactus)
router.get('/contact/findall', contactusController.getAllContact)
router.delete('/contact/delete/:id', contactusController.deleteContact)
router.put('/contact/update/:id', contactusController.updateContactus)

module.exports = router