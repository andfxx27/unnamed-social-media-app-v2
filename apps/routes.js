const router = require('express').Router();

const followerRouter = require('./follower/routes');
const userRouter = require('./user/routes');

router.use('/api/v1/followers', followerRouter);
router.use('/api/v1/users', userRouter);

module.exports = router;