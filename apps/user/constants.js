const userActionStatusCode = {
    INVALID_SIGN_UP_REQ_BODY: 'UE4001', // signUp
    USER_ALREADY_REGISTERED: 'UE4002',
    INVALID_SIGN_IN_REQ_BODY: 'UE4051', // signIn
    USER_NOT_REGISTERED: 'UE4052',
    INVALID_SIGN_IN_CREDENTIALS: 'UE4053',
    INVALID_EDIT_PROFILE_REQ_BODY: 'UE4101', // editProfile
};

module.exports = userActionStatusCode;