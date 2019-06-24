const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, './tmp/csv/')
    },
    filename: (req, file, cb) => {
        return cb(null, new Date().getMilliseconds() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
        // Aceptar archivo
        return cb(null, true)
    } else {
        // Rechazar archivos
        return cb(null, false);
    }
}

const uploadFiles = multer({

    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
}).single('file');

module.exports = {
    uploadFiles
}