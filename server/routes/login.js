const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const app = express();
const validateLoginInput = require('../validation/login');
const signin = require('./signin');

app.post('/login', signin.signinAuthotication(bcrypt));

module.exports = app;