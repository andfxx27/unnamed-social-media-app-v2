const express = require('express');
const fs = require('fs');
const httpStatusCodes = require('http-status-codes');
const uuid = require('uuid');

const appConstants = require('./../constants');
const db = require('../../configs/database');
const httpResponses = require('./../http-responses');
const logger = require('./../../configs/logger');
const postConstants = require('./constants');
const validator = require('./validator');

/**
 * @todo 
 * Figure out how to package/ send individual post detail user tag information
 * @example
 * a. First way is to use form-data, append multiple post detail user tag using array notation, e.g. usertag[n] = [id1, id2, ...]
 * b. With this method, we assume each usertag information matches with each uploaded post detail file
 * 
 * @todo
 * Figure out rough flow for creating a post
 * 
 * @description Function for user to create post
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 * @returns 
 */
const createPost = async (req, res, next) => {
    try {
        // Prepare default response body
        const respBody = httpResponses.createDefaultResponseBody();
        respBody.message = 'Success create post.';

        // Retrieve request body, file, and decoded jwt from res.locals
        const reqBody = req.body;
        const files = req.files;
        const decodedJwt = res.locals.decodedJwt;

        // Validate file
        if (files == undefined || files.length === 0) {
            respBody.message = "Failed create post, field 'media' might be empty or invalid.";
            respBody.http_status_code = httpStatusCodes.StatusCodes.BAD_REQUEST;
            respBody.application_specific_status_code = postConstants.CREATE_POST_FAILED_INVALID_REQ_BODY;
            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        // Validate request body
        const reqBodyValidationResult = validator.validateCreatePostReqBody(reqBody);
        if (!reqBodyValidationResult.isValid) {
            respBody.message = 'Failed create post, invalid request body.';
            respBody.http_status_code = httpStatusCodes.StatusCodes.BAD_REQUEST;
            respBody.application_specific_status_code = postConstants.CREATE_POST_FAILED_INVALID_REQ_BODY;
            respBody.result = reqBodyValidationResult.result;
            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        // Parse usertag for each individual post detail
        const usertag = reqBody.usertag.map((v) => JSON.parse(v));

        if (usertag.length !== req.files.length) {
            respBody.message = 'Failed create post, invalid request body.';
            respBody.http_status_code = httpStatusCodes.StatusCodes.BAD_REQUEST;
            respBody.application_specific_status_code = postConstants.CREATE_POST_FAILED_INVALID_REQ_BODY;
            respBody.result = reqBodyValidationResult.result;
            return res
                .status(respBody.http_status_code)
                .json(respBody);
        }

        // Retrieve hashtag from post caption
        const hashtag = Array.from(reqBody.caption.matchAll(/#[a-zA-Z0-9]*/g)).map((v) => v[0]);

        // Construct the post's media array of object
        const postDetail = req.files.map((file, index) => {
            // Determine media type for each uploaded file (post detail)
            const mediaType = file.mimetype.split('/')[0];

            delete file.fieldname;

            return {
                id: uuid.v4(),
                usertag: usertag[index],
                file: { ...file },
                mediaType
            };
        });

        // Prepare user post directory
        const postId = uuid.v4();
        await fs.promises.mkdir(`uploads/user/${decodedJwt.user_id}/post/${postId}/`, { recursive: true });

        /**
         * Upload post detail's file buffer to filesystem
         * uploads/user/<user_id>/post/<post_id>/<post_detail_id>.extension
         */
        await Promise.all(postDetail.map((p, index) => {
            const filePath = `uploads/user/${decodedJwt.user_id}/post/${postId}/${p.id}.${p.file.originalname.split('.')[1]}`;
            postDetail[index].mediaUrl = filePath;
            return fs.promises.writeFile(filePath, p.file.buffer);
        }));

        // Do create post logic
        const taskTag = 'createPost';
        const result = await db.tx(taskTag, async (t) => {
            // Insert post
            await t.none(
                `INSERT INTO public.post (post_id, user_id, caption) VALUES ($1,$2,$3)`,
                [
                    postId,
                    decodedJwt.user_id,
                    reqBody.caption
                ]
            );

            // Insert post detail
            const postDetailInsertQueries = postDetail.map((p) => {
                return t.none(
                    `INSERT INTO public.post_detail (post_detail_id, post_id, media_url, media_type) VALUES ($1,$2,$3,$4)`,
                    [
                        p.id,
                        postId,
                        p.mediaUrl,
                        p.mediaType
                    ]
                );
            });
            await t.batch(postDetailInsertQueries);

            // Insert hashtag
            const hashtagInsertQueries = hashtag.map((h) => {
                return t.none(
                    `INSERT INTO public.hashtag (hashtag_id, name) VALUES ($1,$2) ON CONFLICT (name) DO NOTHING`,
                    [
                        uuid.v4(),
                        h.substring(1)
                    ]
                );
            });
            await t.batch(hashtagInsertQueries);

            // Get hashtag by name
            const hashtagIds = await t.manyOrNone(
                `SELECT hashtag_id FROM public.hashtag WHERE name IN ($1:csv)`,
                [hashtag]
            );

            // Insert post hashtag
            const postHashtagInsertQueries = hashtagIds.map((id) => {
                return t.none(
                    `INSERT INTO public.post_hashtag (post_id, hashtag_id) VALUES ($1,$2)`,
                    [postId, id]
                );
            });
            await t.batch(postHashtagInsertQueries);

            // Insert post detail usertag
            const postDetailUsertagInsertQueries = [];
            postDetail.forEach((p) => {
                p.usertag.forEach((userId) => {
                    postDetailUsertagInsertQueries.push(t.none(
                        `INSERT INTO public.post_detail_usertag (post_detail_id, user_id) VALUES ($1,$2)`,
                        [
                            p.id,
                            userId
                        ]
                    ));
                });
            });
            await t.batch(postDetailUsertagInsertQueries);

            return appConstants.SUCCESS;
        });

        respBody.http_status_code = httpStatusCodes.StatusCodes.OK;
        respBody.application_specific_status_code = result;

        logger.info(`Task ${taskTag} complete`);

        return res
            .status(respBody.http_status_code)
            .json(respBody);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createPost
};