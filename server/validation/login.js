// login.js

const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateLoginInput(data) {
    let errors = {};
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if (!Validator.isEmail(data.email)) {
        errors.email = 'Es necesario el correo';
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = 'Es necesario el correo';
    }

    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = 'Password must have 6 chars';
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = 'Es necesaria la contraseña';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}