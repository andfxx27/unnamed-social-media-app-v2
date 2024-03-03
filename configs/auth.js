const express = require('express');
const httpStatusCodes = require('http-status-codes');
const jwt = require('jsonwebtoken');

const appConstants = require('./../apps/constants');
const db = require('./database');
const environmentVariables = require('./environment-variables');

const signJwt = async (payload) => {
    const secret = environmentVariables.JWT_AUTHENTICATION_SECRET;
    const issuer = environmentVariables.APPLICATION_NAME;
    const expiresIn = environmentVariables.JWT_AUTHENTICATION_EXPIRATION_TIME;

    return await new Promise((resolve, reject) => {
        jwt.sign(payload, secret, {
            expiresIn,
            issuer
        }, (error, token) => {
            if (error != null) {
                return reject(error);
            }

            return resolve(token);
        });
    });
};

const verifyJwt = async (token) => {
    const secret = environmentVariables.JWT_AUTHENTICATION_SECRET;

    return await new Promise((resolve, reject) => {
        jwt.verify(token, secret, (error, decoded) => {
            if (error != null) {
                return reject(error);
            }

            return resolve(decoded);
        });
    });
};

/**
 * Middleware to authorize user auth token
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 * @returns
 */
const authMiddleware = async (req, res, next) => {
    try {
        const respBody = {
            message: httpStatusCodes.ReasonPhrases.UNAUTHORIZED,
            http_status_code: httpStatusCodes.StatusCodes.UNAUTHORIZED,
            application_specific_status_code: appConstants.AUTH_ERROR,
            result: null
        };

        const authorization = req.header('Authorization');
        if (authorization == null || authorization == undefined) {
            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        if (!authorization.startsWith('Bearer ')) {
            respBody.message = 'Invalid auth token, must be a valid bearer jwt';

            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        const jwt = authorization.split(' ')[1];
        const decoded = await verifyJwt(jwt);

        // Check if a user by the decoded user id exists
        const user = await db.oneOrNone(
            `SELECT * FROM public.user WHERE user_id = $1`,
            decoded.user_id
        );
        if (user == null) {
            respBody.http_status_code = httpStatusCodes.StatusCodes.NOT_FOUND;
            respBody.message = httpStatusCodes.ReasonPhrases.NOT_FOUND;

            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        /**
         * Simple layer of protection for manipulating resources without authorization for that
         * 
         * Suppose a user get hold of other user's jwt
         * We need to make sure that each jwt can only be used for manipulating resource binded to the jwt
         * Meaning, we cannot use person A's jwt to manipulate person B information
         */
        const userId = req.params.userId;
        if (userId != null && userId != undefined && userId != decoded.user_id) {
            respBody.http_status_code = httpStatusCodes.StatusCodes.FORBIDDEN;
            respBody.message = httpStatusCodes.ReasonPhrases.FORBIDDEN;

            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        res.locals.decodedJwt = decoded;

        return next();
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    signJwt,
    authMiddleware
};