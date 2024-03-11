const router = require('express').Router();

const followRouter = require('./follow/routes');
const postRouter = require('./post/routes');
const userRouter = require('./user/routes');

router.use('/api/v1/users', userRouter);
router.use('/api/v1/users', followRouter.userFollowSubrouter);
router.use('/api/v1/users', postRouter.userPostSubrouter);

module.exports = router;