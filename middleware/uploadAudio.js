const multer = require('multer');
const path = require('path');
const fs = require('fs');

// uploads/audio papkasini avtomatik yaratish
const uploadDir = path.join(__dirname, '../public/uploads/audio');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Yuklash joyi
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // absolut path
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

// Faqat audio fayllarni qabul qilish (ko'p format)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /mp3|wav|m4a|ogg|aac|flac/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Faqat audio formatdagi fayllar yuklash mumkin!'), false);
    }
};

const uploadAudio = multer({ storage, fileFilter });

module.exports = uploadAudio;
