const httpStatusCodes = require('http-status-codes');

const appConstants = require('./constants');

function createDefaultResponseBody() {
    return {
        message: '',
        http_status_code: httpStatusCodes.StatusCodes.OK,
        application_specific_status_code: appConstants.SUCCESS,
        result: null
    };
}

module.exports = {
    createDefaultResponseBody
};