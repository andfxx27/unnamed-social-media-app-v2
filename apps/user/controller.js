const fs = require('fs');

const bcrypt = require('bcrypt');
const express = require('express');
const httpStatusCodes = require('http-status-codes');
const uuid = require('uuid');

const db = require('./../../configs/database');
const logger = require('./../../configs/logger');
const validator = require('./validator');

/**
 * Function for new user to sign up
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const signUp = async (req, res, next) => {
    try {
        // Prepare default response body
        const respBody = {
            message: 'Success sign up',
            httpStatusCode: httpStatusCodes.StatusCodes.CREATED,
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
        const reqBodyValidationResult = validator.validateRegisterReqBody(reqBody);
        if (!reqBodyValidationResult.isValid) {
            respBody.message = 'Failed sign up';
            respBody.httpStatusCode = httpStatusCodes.StatusCodes.BAD_REQUEST;
            respBody.result = reqBodyValidationResult.result;
            return res.status(respBody.httpStatusCode).json(respBody);
        }

        /**
         * Retrieve user id from uploaded file path
         * We will generate uuid and create empty avatar directory for user which doesn't provide avatar during sign up process
         */
        let userId = "";

        if (file == undefined) {
            userId = uuid.v4();
            fs.promises.mkdir(`uploads/user/${userId}/avatar/`, { recursive: true });
        } else {
            userId = reqBody.avatar_url.split("/")[2];
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(reqBody.password, 10);

        console.log(reqBody);

        // Do sign up logic
        const taskTag = 'signUp';
        db.task(taskTag, async (t) => {
            // Check if a user with same credentials is already registered
            const user = await t.oneOrNone(
                'SELECT * FROM public.user WHERE username = $1 OR email = $2 OR phone_number = $3',
                [
                    reqBody.username,
                    reqBody.email,
                    reqBody.phone_number
                ]
            );
            if (user != null) {
                return false;
            }

            // Proceed with user sign up process if no existing user found
            await t.none(
                'INSERT INTO public.user (user_id, username, first_name, last_name, email, phone_number, password, date_of_birth, avatar_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
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

            return true;
        })
            .then((ok) => {
                if (!ok) {
                    respBody.message = "Failed sign up, please check the credentials used";
                    respBody.httpStatusCode = httpStatusCodes.StatusCodes.BAD_REQUEST;

                    // If the registration process failed, delete the uploads/user directory
                    const userUploadsDir = `uploads/user/${userId}`;
                    fs.promises.rm(userUploadsDir, { recursive: true, force: true })
                        .then((result) => {
                            logger.info(`Task ${taskTag} incomplete, success deleting ${userUploadsDir} directory`);
                        })
                        .catch((error) => {
                            return next(error);
                        });
                } else {
                    logger.info(`Task ${taskTag} complete, success register user with user id of ${userId}`);
                }
            })
            .catch((error) => {
                return next(error);
            })
            .finally(() => {
                return res
                    .status(respBody.httpStatusCode)
                    .json(respBody);
            });
    } catch (error) {
        return next(error);
    }
};

const signIn = async (req, res, next) => {
    res.json({ message: 'Sign in is under development' });
};

module.exports = {
    signUp,
    signIn
}; 