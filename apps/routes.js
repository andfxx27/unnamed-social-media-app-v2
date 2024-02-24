const router = require('express').Router();

const userRouter = require('./user/routes');

router.use('/api/v1/users', userRouter);

module.exports = router;