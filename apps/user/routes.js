const router = require('express').Router();

const auth = require('./../../configs/auth');
const multerMiddleware = require('./../../configs/multer');
const controller = require('./controller');

router.post(
  '/sign-up',
  multerMiddleware.userSignUpFileUploadMiddleware.single('avatar'),
  controller.signUp
);
router.post(
  '/sign-in',
  controller.signIn
);

router.patch(
  '/:userId/profile',
  auth.authMiddleware,
  multerMiddleware.userEditProfileFileUploadMiddleware.single('avatar'),
  controller.editProfile
);

module.exports = router;