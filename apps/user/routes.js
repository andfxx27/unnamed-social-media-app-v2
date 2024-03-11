const router = require('express').Router();

const auth = require('./../../configs/auth');
const controller = require('./controller');
const multerMiddleware = require('./../../configs/multer');

router.post('/sign-up', multerMiddleware.userSignUpFileUploadMiddleware.single('avatar'), controller.signUp);
router.post('/sign-in', controller.signIn);

router.get('/:userId/profile', controller.getProfile);
router.patch('/:userId/profile', auth.authMiddleware, multerMiddleware.userEditProfileFileUploadMiddleware.single('avatar'), controller.editProfile);

module.exports = router;