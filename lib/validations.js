const validate = require('validate.js');

const VALID_ID = {
  onlyInteger: true,
  greaterThan: 0
};

const USER_VALIDATION = {
  firstName: {
    presence: true
  },
  lastName: {
    presence: true
  },
  username: {
    length: {
      minimum: 3,
      message: "must be at least 3 characters"
    }
  },
  email: {
    presence: true,
    email: true
  },
  password: {
    length: {
      minimum: 12,
      message: 'must be at least 12 characters'
    }
  }
};

exports.signupValidations = function validateUser(userData) {
  return validate(userData, USER_VALIDATION);
};

const CREDS_VALIDATION = {
  email: {
    presence: true,
    email: true
  },
  password: {
    presence: true
  }
};
exports.credentials = function validateCredentials(credsData) {
  return validate(credsData, CREDS_VALIDATION);
};
