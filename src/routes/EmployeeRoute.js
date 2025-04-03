const express = require("express");
const router = express.Router();
const employeeControle = require('../controllers/EmployeeController');
const uploadFiles = require("../middlewares/uploadFilesMiddleware");
//------------------< ADMIN ROUTER >------------------//
router.post('/e1/register', uploadFiles, employeeControle.employeeRegister);
router.get('/e1/all-employee', employeeControle.employeeGetAll);
router.get('/e1/single/:id', employeeControle.getSingleEmp)
router.put('/e1/update/:id', uploadFiles, employeeControle.updateEmployee)
router.delete('/e1/delete/:id', employeeControle.deleteEmployee)

module.exports = router;