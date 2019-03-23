const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const app = express();

app.post('/login', (req, res) => {

    const body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrecto'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrecto'
                }
            });
        }
        let token = jwt.sign({
            user: {
                id: userDB.id,
                role: userDB.role
            }
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN, algorithm: 'HS512' });

        res.json({
            ok: true,
            token
        });
    });
});

module.exports = app;