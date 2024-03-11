const validator = require('validator');

const appValidator = require('./../validator');

const validateCreatePostReqBody = (reqBody) => {
    const requiredFields = [
        'caption',
        'usertag'
    ];

    return appValidator.validateRequiredFieldsWithoutCustomization(postValidator, requiredFields, reqBody);
};

const postValidator = (field, value) => {
    if (value == undefined) {
        return {
            isValid: false,
            field,
            message: `Field '${field}' is required.`
        };
    }

    if (field === 'caption') {
        const isValid = validator.isLength(value, { max: 255 });
        const message = isValid ? null : "Field 'caption' is invalid, must be 255 characters at most.";
        return {
            isValid,
            field,
            message
        };
    }

    if (field === 'usertag') {
        const parsedUsertag = value.map((v) => JSON.parse(v));
        let isValid = true;

        parsedUsertag.forEach((tags) => {
            tags.forEach((t) => {
                isValid = validator.isUUID(t, '4');
            });
        });

        const message = isValid ? null : "Field 'usertag' is invalid, must be an array of array of user id in the form of v4 uuid.";
        return {
            isValid,
            field,
            message
        };
    }
};

module.exports = {
    validateCreatePostReqBody
};