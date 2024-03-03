const validator = require('validator');

const validateRequiredFieldsWithoutCustomization = (requiredFields, reqBody) => {
    const reqBodyValidationResult = {
        isValid: true,
        result: {}
    };

    let validRequiredFieldsCount = 0;

    requiredFields.forEach((key) => {
        const fieldValidationResult = userValidator(key, reqBody[key]);
        if (fieldValidationResult.isValid) {
            validRequiredFieldsCount++;
        } else {
            reqBodyValidationResult.result[key] = fieldValidationResult.message;
        }
    });

    reqBodyValidationResult.isValid = validRequiredFieldsCount === requiredFields.length;

    return reqBodyValidationResult;
};

const validateSignUpReqBody = (reqBody) => {
    const requiredFields = [
        'username',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'password',
        'date_of_birth'
    ];

    return validateRequiredFieldsWithoutCustomization(requiredFields, reqBody);
};

const validateSignInReqBody = (reqBody) => {
    const requiredFields = [
        'identifier',
        'password'
    ];

    const reqBodyValidationResult = {
        isValid: true,
        result: {}
    };

    let validRequiredFieldsCount = 0;

    requiredFields.forEach((key) => {
        if (key === 'identifier') {
            // For 'identifier' field, user can send either username, email, or phone number for login process
            const fieldsValidationResult = [
                userValidator('username', reqBody[key]),
                userValidator('email', reqBody[key]),
                userValidator('phone_number', reqBody[key]),
            ];

            if (fieldsValidationResult.filter((r) => r.isValid).length > 0) {
                validRequiredFieldsCount++;
            } else {
                reqBodyValidationResult.result[key] = `Field '${key}' is invalid, must be either a valid username, email, or phone number.`;
            }
        } else if (key === 'password') {
            const isValid = reqBody[key] != undefined;
            if (isValid) {
                validRequiredFieldsCount++;
            } else {
                reqBodyValidationResult.result[key] = `Field '${key} is invalid, it is required.'`;
            }
        }
    });

    reqBodyValidationResult.isValid = validRequiredFieldsCount === requiredFields.length;

    return reqBodyValidationResult;
};

const validateEditProfileReqBody = (reqBody) => {
    const requiredFields = [
        'first_name',
        'last_name',
        'date_of_birth'
    ];

    return validateRequiredFieldsWithoutCustomization(requiredFields, reqBody);
};

const userValidator = (field, value) => {
    if (value == undefined) {
        return {
            isValid: false,
            field,
            message: `Field '${field}' is required.`
        };
    }

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
    validateSignUpReqBody,
    validateSignInReqBody,
    validateEditProfileReqBody
};