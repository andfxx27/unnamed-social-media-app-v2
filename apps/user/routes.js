const router = require('express').Router();

const multerMiddleware = require('./../../configs/multer');
const controller = require('./controller');

router.post('/sign-up', multerMiddleware.userAvatarFileUploadMiddleware.single('avatar'), controller.signUp);
router.post('/sign-in', controller.signIn);

module.exports = router;