const httpStatusCodes = require('http-status-codes');

const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack + '\n' + 'Url: ' + req.url);

    if (err.message.startsWith('Client error')) {
        return res
            .status(httpStatusCodes.StatusCodes.BAD_REQUEST)
            .json({ message: 'Bad Request, client error' });
    }

    // Thrown by jsonwebtoken.verify() when verifying jwt in auth middleware
    if (err.message.startsWith('jwt expired')) {
        return res
            .status(httpStatusCodes.StatusCodes.UNAUTHORIZED)
            .json({ message: 'Bearer jwt expired, please re-login to the application' });
    }

    // General server error
    return res
        .status(httpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: httpStatusCodes.ReasonPhrases.INTERNAL_SERVER_ERROR });
};

module.exports = {
    errorHandler
};