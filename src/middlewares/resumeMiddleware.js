const path = require('path');
const multer = require('multer');


//============= < MEMORYSTORAGE >===================//
const storageMemo = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, 'resumes');
        } else {
            cb(null, 'uploads');
        }
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

//============= < UPLOAD MEMORY AND DISK >===================//
const upload = multer({
    storage: storageMemo,
    fileFilter: function (req, file, callback) {
        const supportedMimeTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        if (supportedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    }
});

module.exports = upload;