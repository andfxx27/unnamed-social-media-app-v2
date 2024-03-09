const validator = require('validator');

const appValidator = require('./../validator');

const validateFollowReqBody = (reqBody) => {
    const requiredFields = [
        'following_id'
    ];

    return appValidator.validateRequiredFieldsWithoutCustomization(followValidator, requiredFields, reqBody);
};

const validateUnfollowReqBody = (reqBody) => {
    const requiredFields = [
        'following_id'
    ];

    return appValidator.validateRequiredFieldsWithoutCustomization(followValidator, requiredFields, reqBody);
};

const followValidator = (field, value) => {
    if (value == undefined) {
        return {
            isValid: false,
            field,
            message: `Field '${field}' is required.`
        };
    }

    if (field === 'following_id') {
        const isValid = validator.isUUID(value, '4') && !validator.isEmpty(value);
        const message = isValid ? null : "Field 'following_id' is invalid, must be a valid v4 uuid.";
        return {
            isValid,
            field,
            message
        };
    }
};

module.exports = {
    validateFollowReqBody,
    validateUnfollowReqBody
};