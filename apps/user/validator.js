const validator = require('validator');

const validateRegisterReqBody = (reqBody) => {
    const requiredFields = [
        'username',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'password',
        'date_of_birth'
    ];

    const reqBodyValidationResult = {
        isValid: true,
        result: {}
    };

    let validRequiredFieldsCount = 0;

    requiredFields.forEach((key) => {
        if (Object.hasOwnProperty.call(reqBody, key)) {
            const fieldValidationResult = userValidator(key, reqBody[key]);
            if (fieldValidationResult.isValid) {
                validRequiredFieldsCount++;
            } else {
                reqBodyValidationResult.result[key] = fieldValidationResult.message;
            }
        } else {
            reqBodyValidationResult.result[key] = `Field '${key}' is not found, it is required.`;
        }
    });

    reqBodyValidationResult.isValid = validRequiredFieldsCount === requiredFields.length;

    return reqBodyValidationResult;
};

const userValidator = (field, value) => {
    if (field === 'username') {
        const isValid = validator.isLength(value, { max: 255 }) && validator.isAlphanumeric(value);
        const message = isValid ? null : "Field 'username' is invalid, must be alphanumeric and 255 characters at most.";
        return {
            isValid,
            field,
            message
        };
    }

    if (field === 'first_name' || field === 'last_name') {
        const isValid = validator.isLength(value, { max: 255 }) && validator.isAlpha(value);
        const message = isValid ? null : `Field '${field}' is invalid, must contains only letter and 255 characters at most.`;
        return {
            isValid,
            field,
            message
        };
    }

    if (field === 'email') {
        const isValid = validator.isEmail(value);
        const message = isValid ? null : "Field 'email' is invalid, must be a valid email.";
        return {
            isValid,
            field,
            message
        };
    }

    if (field === 'phone_number') {
        const isValid = validator.isMobilePhone(value, 'id-ID');
        const message = isValid ? null : "Field 'phone_number' is invalid, must be a valid id-ID phone number that starts with +62.";
        return {
            isValid,
            field,
            message
        };
    }

    if (field === 'password') {
        const isValid = validator.isStrongPassword(value);
        const message = isValid ? null : "Field 'password' is invalid, must be a strong password.";
        return {
            isValid,
            field,
            message
        };
    }

    if (field === 'date_of_birth') {
        const isValid = validator.isDate(value, { format: 'YYYY-MM-DD' });
        const message = isValid ? null : "Field 'date_of_birth' is invalid, must be in the format of YYYY-MM-DD.";
        return {
            isValid,
            field,
            message
        };
    }
};

module.exports = {
    validateRegisterReqBody
};