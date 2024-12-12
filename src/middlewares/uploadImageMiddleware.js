const path = require('path');
const multer = require('multer');

//------------------<UPLOAD IMAGE>------------------//
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var supportedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        if (supportedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    // limits: {
    //     fileSize: 1024 * 1024 * 2
    // }
});
module.exports = upload;