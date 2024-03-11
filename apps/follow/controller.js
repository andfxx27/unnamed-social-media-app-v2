const express = require('express');
const httpStatusCodes = require('http-status-codes');

const appConstants = require('./../constants');
const db = require('./../../configs/database');
const httpResponses = require('./../http-responses');
const logger = require('./../../configs/logger');
const followConstants = require('./constants');
const validator = require('./validator');

/**
 * Function for user to follow another user
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 * @returns
 */
const follow = async (req, res, next) => {
    try {
        // Prepare default response body
        const respBody = httpResponses.createDefaultResponseBody();
        respBody.message = 'Success follow.';

        // Retrieve request body, and decoded jwt from res.locals
        const reqBody = req.body;
        const decodedJwt = res.locals.decodedJwt;

        // Validate request body
        const reqBodyValidationResult = validator.validateFollowReqBody(reqBody);
        if (!reqBodyValidationResult.isValid) {
            respBody.message = 'Failed follow, invalid request body.';
            respBody.http_status_code = httpStatusCodes.StatusCodes.BAD_REQUEST;
            respBody.application_specific_status_code = followConstants.FOLLOW_FAILED_INVALID_REQ_BODY;
            respBody.result = reqBodyValidationResult.result;
            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        // Prevent user from following themselves
        if (decodedJwt.user_id === reqBody.following_id) {
            respBody.message = "Failed follow, can't follow own account.";
            respBody.http_status_code = httpStatusCodes.StatusCodes.OK;
            respBody.application_specific_status_code = followConstants.FOLLOW_FAILED_SELF_FOLLOW;
            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        // Do follow logic
        const taskTag = 'follow';
        const result = await db.task(taskTag, async (t) => {
            // Check if user to be followed is already registered
            const user = await t.oneOrNone(
                `SELECT * FROM public.user WHERE user_id = $1`,
                reqBody.following_id
            );
            if (user == null) {
                return followConstants.FOLLOW_FAILED_USER_NOT_REGISTERED;
            }

            await t.none(
                `INSERT INTO public.follow (user_id, following_id) VALUES ($1,$2) ON CONFLICT (user_id, following_id) DO NOTHING`,
                [
                    decodedJwt.user_id,
                    reqBody.following_id
                ]
            );

            return appConstants.SUCCESS;
        });

        respBody.http_status_code = httpStatusCodes.StatusCodes.OK;
        respBody.application_specific_status_code = result;

        if (result !== appConstants.SUCCESS) {
            if (result === followConstants.FOLLOW_FAILED_USER_NOT_REGISTERED) {
                respBody.message = 'Failed follow, user with the specified credential is not registered.';
            }

            logger.info(`Task ${taskTag} incomplete, user with id of ${decodedJwt.user_id} might not be following the user with id of ${reqBody.following_id}`);
        } else {
            logger.info(`Task ${taskTag} complete, success follow user with id of ${reqBody.following_id} for user with id of ${decodedJwt.user_id}`);
        }

        return res
            .status(respBody.http_status_code)
            .json(respBody);
    } catch (error) {
        return next(error);
    }
};

/**
 * @todo 
 * Add pagination
 * 
 * @description Function to get certain user's follower(s)
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 * @returns
 */
const getFollowers = async (req, res, next) => {
    try {
        const respBody = httpResponses.createDefaultResponseBody();
        respBody.message = 'Success get followers.';

        // Do get followers logic
        const taskTag = 'getFollowers';
        const followers = await db.manyOrNone(
            `SELECT u.user_id, u.first_name, u.last_name, u.avatar_url, f.follow_date FROM public.follow f INNER JOIN public.user u ON f.user_id = u.user_id WHERE f.following_id = $1`,
            req.params.userId
        );
        if (followers != null) {
            respBody.result = {
                followers
            };
        }

        logger.info(`Task ${taskTag} complete`);

        return res
            .status(respBody.http_status_code)
            .json(respBody);
    } catch (error) {
        return next(error);
    }
};

/**
 * @todo Add pagination
 * 
 * Function to get certain user's following(s)
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 * @returns
 */
const getFollowings = async (req, res, next) => {
    try {
        const respBody = httpResponses.createDefaultResponseBody();
        respBody.message = 'Success get followings.';

        // Do get followings logic
        const taskTag = 'getFollowings';
        const followings = await db.manyOrNone(
            `SELECT u.user_id, u.first_name, u.last_name, u.avatar_url, f.follow_date FROM public.follow f INNER JOIN public.user u ON f.following_id = u.user_id WHERE f.user_id = $1`,
            req.params.userId
        );
        if (followings != null) {
            respBody.result = {
                followings
            };
        }

        logger.info(`Task ${taskTag} complete`);

        return res
            .status(respBody.http_status_code)
            .json(respBody);
    } catch (error) {
        return next(error);
    }
};

/**
 * Function for user to unfollow another user
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 * @returns
 */
const unfollow = async (req, res, next) => {
    try {
        // Prepare default response body
        const respBody = {
            message: 'Success unfollow.',
            http_status_code: httpStatusCodes.StatusCodes.OK,
            application_specific_status_code: appConstants.SUCCESS,
            result: null
        };

        // Retrieve request body, and decoded jwt from res.locals
        const reqBody = req.body;
        const decodedJwt = res.locals.decodedJwt;

        // Validate request body
        const reqBodyValidationResult = validator.validateUnfollowReqBody(reqBody);
        if (!reqBodyValidationResult.isValid) {
            respBody.message = 'Failed unfollow, invalid request body.';
            respBody.http_status_code = httpStatusCodes.StatusCodes.BAD_REQUEST;
            respBody.application_specific_status_code = userConstants.UNFOLLOW_FAILED_INVALID_REQ_BODY;
            respBody.result = reqBodyValidationResult.result;
            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        // Prevent user from unfollowing themselves
        if (decodedJwt.user_id === reqBody.following_id) {
            respBody.message = "Failed unfollow, can't unfollow own account.";
            respBody.http_status_code = httpStatusCodes.StatusCodes.OK;
            respBody.application_specific_status_code = userConstants.UNFOLLOW_FAILED_SELF_UNFOLLOW;
            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        // Do unfollow logic
        const taskTag = 'unfollow';
        const result = await db.task(taskTag, async (t) => {
            // Check if user to be unfollowed is already registered
            const user = await t.oneOrNone(
                `SELECT * FROM public.user WHERE user_id = $1`,
                reqBody.following_id
            );
            if (user == null) {
                return userConstants.UNFOLLOW_FAILED_USER_NOT_REGISTERED;
            }

            await t.none(
                `DELETE FROM public.follow WHERE user_id = $1 AND following_id = $2`,
                [
                    decodedJwt.user_id,
                    reqBody.following_id
                ]
            );

            return appConstants.SUCCESS;
        });

        respBody.http_status_code = httpStatusCodes.StatusCodes.OK;
        respBody.application_specific_status_code = result;

        if (result !== appConstants.SUCCESS) {
            if (result === userConstants.UNFOLLOW_FAILED_USER_NOT_REGISTERED) {
                respBody.message = 'Failed unfollow, user with the specified credential is not registered.';
            }

            logger.info(`Task ${taskTag} incomplete, user with id of ${decodedJwt.user_id} might not be unfollowing the user with id of ${reqBody.following_id}`);
        } else {
            logger.info(`Task ${taskTag} complete, success unfollow user with id of ${reqBody.following_id} for user with id of ${decodedJwt.user_id}`);
        }

        return res
            .status(respBody.http_status_code)
            .json(respBody);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    follow,
    getFollowers,
    getFollowings,
    unfollow
};