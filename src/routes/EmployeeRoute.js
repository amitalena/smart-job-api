const express = require("express");
const router = express.Router();
const employeeControle = require('../controllers/EmployeeController');
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

//------------------< ADMIN ROUTER >------------------//
router.post('/employee/upload', upload.single('employeeImage'), employeeControle.employeeRegister);
router.get('/employee/get-all-employee', employeeControle.employeeGetAll);

module.exports = router;