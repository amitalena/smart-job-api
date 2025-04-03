const multer = require("multer");
const path = require("path");

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "profileImage") {
            cb(null, "./uploads");
        } else if (file.fieldname === "resume") {
            cb(null, "./resumes");
        }
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

// File filters
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Only images and PDF files are allowed"), false);
    }
    cb(null, true);
};

// Multer instance
const upload = multer({
    storage,
    fileFilter,
});

// Middleware for handling multiple file uploads
const uploadFiles = upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "resume", maxCount: 1 },
]);

module.exports = uploadFiles;