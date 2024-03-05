const fs = require('fs');

const bcrypt = require('bcrypt');
const express = require('express');
const httpStatusCodes = require('http-status-codes');
const uuid = require('uuid');

const appConstants = require('./../constants');
const auth = require('./../../configs/auth');
const db = require('./../../configs/database');
const logger = require('./../../configs/logger');
const userConstants = require('./constants');
const validator = require('./validator');

/**
 * Function for new user to sign up
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns
 */
const signUp = async (req, res, next) => {
    try {
        // Prepare default response body
        const respBody = {
            message: 'Success sign up',
            http_status_code: httpStatusCodes.StatusCodes.OK,
            application_specific_status_code: appConstants.SUCCESS,
            result: null
        };

        // Retrieve request body & file
        const reqBody = req.body;
        const file = req.file;

        // Adjust the uploaded file path for database insertion process
        if (file != undefined) {
            reqBody.avatar_url = file.path.split('\\').join('/');
        }

        // Validate request body
        const reqBodyValidationResult = validator.validateSignUpReqBody(reqBody);
        if (!reqBodyValidationResult.isValid) {
            respBody.message = 'Failed sign up, invalid request body';
            respBody.http_status_code = httpStatusCodes.StatusCodes.BAD_REQUEST;
            respBody.application_specific_status_code = userConstants.INVALID_SIGN_UP_REQ_BODY;
            respBody.result = reqBodyValidationResult.result;

            if (file != undefined) {
                const userUploadsDir = `uploads/user/${reqBody.avatar_url.split('/')[2]}`;
                await fs.promises.rm(userUploadsDir, { recursive: true, force: false });
            }

            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        /**
         * Retrieve user id from uploaded file path
         * We will generate uuid and create empty avatar directory for user which doesn't provide avatar during sign up process
         */
        let userId = '';
        if (file == undefined) {
            userId = uuid.v4();
            reqBody.avatar_url = 'uploads/default/avatar.jpg';
            await fs.promises.mkdir(`uploads/user/${userId}/avatar/`, { recursive: true });
        } else {
            userId = reqBody.avatar_url.split('/')[2];
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(reqBody.password, 10);

        // Do sign up logic
        const taskTag = 'signUp';
        const result = await db.task(taskTag, async (t) => {
            // Check if a user with same credential is already registered
            const user = await t.oneOrNone(
                `SELECT * FROM public.user WHERE username = $1 OR email = $2 OR phone_number = $3`,
                [
                    reqBody.username,
                    reqBody.email,
                    reqBody.phone_number
                ]
            );
            if (user != null) {
                return userConstants.USER_ALREADY_REGISTERED;
            }

            await t.none(
                `INSERT INTO public.user (user_id, username, first_name, last_name, email, phone_number, password, date_of_birth, avatar_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
                [
                    userId,
                    reqBody.username,
                    reqBody.first_name,
                    reqBody.last_name,
                    reqBody.email,
                    reqBody.phone_number,
                    hashedPassword,
                    reqBody.date_of_birth,
                    reqBody.avatar_url
                ]
            );

            return appConstants.SUCCESS;
        });

        respBody.http_status_code = httpStatusCodes.StatusCodes.OK;
        respBody.application_specific_status_code = result;

        if (result !== appConstants.SUCCESS) {
            if (result === userConstants.INVALID_SIGN_UP_REQ_BODY) {
                respBody.message = 'Failed sign up, invalid request body';
            } else if (result === userConstants.USER_ALREADY_REGISTERED) {
                respBody.message = 'Failed sign up, user with same credential is already registered';
            }

            // If the registration process failed, delete the uploads/user directory
            const userUploadsDir = `uploads/user/${userId}`;
            await fs.promises.rm(userUploadsDir, { recursive: true, force: false });
            logger.info(`Task ${taskTag} incomplete, success deleting ${userUploadsDir} directory`);
        }

        return res
            .status(respBody.http_status_code)
            .json(respBody);
    } catch (error) {
        return next(error);
    }
};

/**
 * Function for registered users to sign in (get auth token)
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 * @returns 
 */
const signIn = async (req, res, next) => {
    try {
        // Prepare default response body
        const respBody = {
            message: 'Success sign in',
            http_status_code: httpStatusCodes.StatusCodes.OK,
            application_specific_status_code: appConstants.SUCCESS,
            result: null
        };

        // Retrieve request body
        const reqBody = req.body;

        // Validate request body
        const validationResult = validator.validateSignInReqBody(reqBody);
        if (!validationResult.isValid) {
            respBody.message = 'Failed sign in, invalid request body';
            respBody.http_status_code = httpStatusCodes.StatusCodes.BAD_REQUEST;
            respBody.application_specific_status_code = userConstants.INVALID_SIGN_IN_REQ_BODY;
            respBody.result = validationResult.result;
            return res
                .status(respBody.status)
                .json(respBody);
        }

        // Do sign in logic
        const taskTag = 'signIn';
        const result = await db.tx(taskTag, async (t) => {
            // Check if a user with provided credential is already registered
            const user = await t.oneOrNone(
                `SELECT * FROM public.user WHERE username = $1 OR email = $2 OR phone_number = $3`,
                [
                    reqBody.identifier,
                    reqBody.identifier,
                    reqBody.identifier
                ]
            );
            if (user == null) {
                return userConstants.USER_NOT_REGISTERED;
            }

            // Check if provided password is correct
            const correctPassword = await bcrypt.compare(reqBody.password, user.password);
            if (!correctPassword) {
                return userConstants.INVALID_SIGN_IN_CREDENTIALS;
            }

            // Generate authentication token (JWT)
            const token = await auth.signJwt({
                user_id: user.user_id,
                username: user.username
            });

            respBody.result = { access_token: token };

            return appConstants.SUCCESS;
        });

        respBody.http_status_code = httpStatusCodes.StatusCodes.OK;
        respBody.application_specific_status_code = result;

        if (result !== appConstants.SUCCESS) {
            if (result === userConstants.INVALID_SIGN_IN_REQ_BODY) {
                respBody.message = 'Failed sign in, invalid request body';
            } else if (result === userConstants.USER_NOT_REGISTERED) {
                respBody.message = 'Failed sign in, user with the specified credential is not registered';
            } else if (result === userConstants.INVALID_SIGN_IN_CREDENTIALS) {
                respBody.message = 'Failed sign in, invalid sign in credential';
            }

            logger.info(`Task ${taskTag} incomplete, user with identifier of ${reqBody.identifier} might not be registered or wrong password is entered`);
        } else {
            logger.info(`Task ${taskTag} complete, success sign in for user with identifier of ${reqBody.identifier}`);
        }

        return res
            .status(respBody.http_status_code)
            .json(respBody);
    } catch (error) {
        return next(error);
    }
};

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
        const respBody = {
            message: 'Success follow.',
            http_status_code: httpStatusCodes.StatusCodes.OK,
            application_specific_status_code: appConstants.SUCCESS,
            result: null
        };

        // Retrieve request body, and decoded jwt from res.locals
        const reqBody = req.body;
        const decodedJwt = res.locals.decodedJwt;

        // Validate request body
        const reqBodyValidationResult = validator.validateFollowReqBody(reqBody);
        if (!reqBodyValidationResult.isValid) {
            respBody.message = 'Failed follow, invalid request body.';
            respBody.http_status_code = httpStatusCodes.StatusCodes.BAD_REQUEST;
            respBody.application_specific_status_code = userConstants.FOLLOW_FAILED_INVALID_REQ_BODY;
            respBody.result = reqBodyValidationResult.result;
            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        // Prevent user from following themselves
        if (decodedJwt.user_id === reqBody.following_id) {
            respBody.message = "Failed follow, can't follow own account.";
            respBody.http_status_code = httpStatusCodes.StatusCodes.OK;
            respBody.application_specific_status_code = userConstants.FOLLOW_FAILED_SELF_FOLLOW;
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
                return userConstants.FOLLOW_FAILED_USER_NOT_REGISTERED;
            }

            await t.none(
                `INSERT INTO public.follower (user_id, following_id) VALUES ($1,$2) ON CONFLICT (user_id, following_id) DO NOTHING`,
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
            if (result === userConstants.FOLLOW_FAILED_USER_NOT_REGISTERED) {
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
                `DELETE FROM public.follower WHERE following_id = $1`,
                reqBody.following_id
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

/**
 * Function to get user profile
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 * @returns
 */
const getProfile = async (req, res, next) => {
    try {
        // Prepare default response body
        const respBody = {
            message: 'Success get profile',
            http_status_code: httpStatusCodes.StatusCodes.OK,
            application_specific_status_code: appConstants.SUCCESS,
            result: null
        };

        // Do get profile logic
        const taskTag = 'getProfile';
        const user = await db.oneOrNone(
            `SELECT * FROM public.user WHERE user_id = $1`,
            req.params.userId
        );
        if (user != null) {
            delete user.password;

            respBody.result = {
                user: {
                    ...user
                }
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
 * Function for user to edit their own profile
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 * @returns
 */
const editProfile = async (req, res, next) => {
    try {
        // Prepare default response body
        const respBody = {
            message: 'Success edit profile',
            http_status_code: httpStatusCodes.StatusCodes.OK,
            application_specific_status_code: appConstants.SUCCESS,
            result: null
        };

        // Retrieve request body, file, and decoded jwt from res.locals
        const reqBody = req.body;
        const file = req.file;
        const decodedJwt = res.locals.decodedJwt;

        // Validate request body
        const reqBodyValidationResult = validator.validateEditProfileReqBody(reqBody);
        if (!reqBodyValidationResult.isValid) {
            respBody.message = 'Failed edit profile, invalid request body';
            respBody.http_status_code = httpStatusCodes.StatusCodes.BAD_REQUEST;
            respBody.application_specific_status_code = userConstants.INVALID_EDIT_PROFILE_REQ_BODY;
            respBody.result = reqBodyValidationResult.result;
            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        // Do edit profile logic
        const taskTag = 'editProfile';
        await db.task(taskTag, async (t) => {
            await t.none(
                `UPDATE public.user SET first_name = $1, last_name = $2, date_of_birth = $3`,
                [
                    reqBody.first_name,
                    reqBody.last_name,
                    reqBody.date_of_birth
                ]
            );

            // Handle uploaded file buffer
            const filePath = `uploads/user/${decodedJwt.user_id}/avatar/avatar.jpg`;
            await fs.promises.writeFile(filePath, file.buffer);

            return appConstants.SUCCESS;
        });

        logger.info(`Task ${taskTag} complete`);

        return res
            .status(respBody.http_status_code)
            .json(respBody);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    signUp,
    signIn,
    follow,
    unfollow,
    getProfile,
    editProfile
}; 