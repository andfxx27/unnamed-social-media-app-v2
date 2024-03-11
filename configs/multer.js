const fs = require('fs');
const multer = require('multer');
const uuid = require('uuid');

const imageFileWhitelist = [
    'image/png',
    'image/jpeg',
    'image/jpg'
];

const videoFileWhitelist = [
    'video/mp4'
];

const generateUserAvatarFileName = (file) => {
    const splitFileOriginalName = file.originalname.split('.');
    const extension = splitFileOriginalName[splitFileOriginalName.length - 1];
    const finalFileName = `avatar.${extension}`;
    return finalFileName;
};

// File upload storage
const userSignUpFileUploadStorage = multer.diskStorage({
    destination: async (req, file, callback) => {
        // Generate user id here for later use
        const userId = uuid.v4();

        const filePath = `uploads/user/${userId}/avatar/`;

        try {
            await fs.promises.access(filePath);
        } catch (error) {
            await fs.promises.mkdir(filePath, { recursive: true });
        }

        callback(null, filePath);
    },
    filename: (req, file, callback) => {
        callback(null, generateUserAvatarFileName(file));
    }
});

const userEditProfileFileUploadStorage = multer.memoryStorage();

const userCreatePostFileUploadStorage = multer.memoryStorage();

// File upload middleware
const userSignUpFileUploadMiddleware = multer({
    storage: userSignUpFileUploadStorage,
    fileFilter: (req, file, cb) => {
        if (!imageFileWhitelist.includes(file.mimetype)) {
            return cb(new Error('Client error, file is not allowed'));
        }

        cb(null, true);
    }
});

const userEditProfileFileUploadMiddleware = multer({
    storage: userEditProfileFileUploadStorage,
    fileFilter: (req, file, cb) => {
        if (!imageFileWhitelist.includes(file.mimetype)) {
            return cb(new Error('Client error, file is not allowed'));
        }

        cb(null, true);
    }
});

const userCreatePostFileUploadMiddleware = multer({
    storage: userCreatePostFileUploadStorage,
    fileFilter: (req, file, cb) => {
        if (!videoFileWhitelist.includes(file.mimetype) && !imageFileWhitelist.includes(file.mimetype)) {
            return cb(new Error('Client error, file is not allowed'));
        }

        cb(null, true);
    }
});

module.exports = {
    userSignUpFileUploadMiddleware,
    userEditProfileFileUploadMiddleware,
    userCreatePostFileUploadMiddleware
};