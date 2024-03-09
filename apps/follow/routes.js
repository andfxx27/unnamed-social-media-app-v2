const userFollowSubrouter = require('express').Router();
const followSubrouter = require('express').Router();

const auth = require('./../../configs/auth');
const controller = require('./controller');

userFollowSubrouter.post('/:userId/followings', auth.authMiddleware, controller.follow);
userFollowSubrouter.get('/:userId/followings', controller.getFollowings);
userFollowSubrouter.delete('/:userId/followings', auth.authMiddleware, controller.unfollow);

userFollowSubrouter.get('/:userId/followers', controller.getFollowers);

module.exports = {
    userFollowSubrouter,
    followSubrouter
};