const userPostSubrouter = require('express').Router();
const postSubrouter = require('express').Router();

const auth = require('./../../configs/auth');
const controller = require('./controller');
const multerMiddleware = require('./../../configs/multer');

userPostSubrouter.post('/:userId/posts', auth.authMiddleware, multerMiddleware.userCreatePostFileUploadMiddleware.array('media', 10), controller.createPost);

module.exports = {
    userPostSubrouter,
    postSubrouter
};