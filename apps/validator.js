const validateRequiredFieldsWithoutCustomization = (entityValidator, requiredFields, reqBody) => {
    const reqBodyValidationResult = {
        isValid: true,
        result: {}
    };

    let validRequiredFieldsCount = 0;

    requiredFields.forEach((key) => {
        const fieldValidationResult = entityValidator(key, reqBody[key]);
        if (fieldValidationResult.isValid) {
            validRequiredFieldsCount++;
        } else {
            reqBodyValidationResult.result[key] = fieldValidationResult.message;
        }
    });

    reqBodyValidationResult.isValid = validRequiredFieldsCount === requiredFields.length;

    return reqBodyValidationResult;
};

module.exports = {
    validateRequiredFieldsWithoutCustomization
};