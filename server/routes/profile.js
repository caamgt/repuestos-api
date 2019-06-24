const express = require('express');
const app = express();
const User = require('../models/user');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');

app.get('/profile/:id', verificaToken, (req, res) => {
    const { id } = req.params;

    if (!id) {
        return Promise.reject('Es necesario el ID');
    }
    return User.findById(id)
        .then(user => {
            if (!user) {
                return res.status(400).json('Not found');
            } else {
                res.json(user)
            }
        })
        .catch(err => res.status(400).json('Usuario no existe'))
});

app.put('/profile/:id', verificaToken, (req, res) => {
    const { id } = req.params;
    const body = _.pick(req.body.formInput, ['nombre', 'apellido', 'img']);
    return User.findByIdAndUpdate(id, body, { new: true, runValidators: true })
        .then(user => {
            if (!user) {
                return res.status(400).json('Usuario no encontrado');
            } else {
                return res.json(user);
            }
        })
        .catch(err => res.status(400).json('Usuario no existe'))
});
module.exports = app;