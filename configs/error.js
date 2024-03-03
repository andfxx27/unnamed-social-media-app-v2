const httpStatusCodes = require('http-status-codes');

const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack + '\n' + 'Url: ' + req.url);

    if (err.message.startsWith('Client error')) {
        return res.status(httpStatusCodes.StatusCodes.BAD_REQUEST).json({ message: 'Bad Request, client error' });
    }

    return res.status(httpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: httpStatusCodes.ReasonPhrases.INTERNAL_SERVER_ERROR });
};

module.exports = {
    errorHandler
};