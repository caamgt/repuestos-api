const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const User = require('../models/user');
const { verificaToken, verificaAdmin_Rol } = require('../middlewares/autenticacion');

app.get('/users', [verificaToken, verificaAdmin_Rol], (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.desde || 5;
    limite = Number(limite);

    User.find({ estado: true }, 'nombre email estado img role')
        .sort('nombre')
        .skip(desde)
        .limit(limite)
        .populate('creator', 'nombre')
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            User.countDocuments({ estado: true }, (err, totalUsers) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                return res.json({
                    ok: true,
                    users,
                    totalUsers
                });
            });
        })
});

app.post('/user', [verificaToken, verificaAdmin_Rol], (req, res) => {
    const body = req.body;

    const user = new User({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
        creator: req.usuario.id
    });

    user.save((err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        return res.json({
            ok: true,
            user: userDB
        });
    });
});

app.put('/user/:id', [verificaToken, verificaAdmin_Rol], (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        return res.json({
            ok: true,
            user: userDB
        });
    })
});

// Deshabilitar el registro, o cambiar el estado.
app.delete('/user/:id', [verificaToken, verificaAdmin_Rol], (req, res) => {
    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    }

    User.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, userToDisable) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'No se encontro el usuario'
            });
        }

        return res.json({
            ok: true,
            userToDisable
        });
    })
});

// Borrar fisicamente el registro de la base de datos

// app.delete('/user/:id', (req, res) => {
//     let id = req.params.id;
//     User.findByIdAndRemove(id, (err, deleteUser) => {
//         if (err) {
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: 'No existe este usuario'
//                 }
//             });
//         }

//         if (!deleteUser) {
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: 'Usuario no encontrado'
//                 }
//             });
//         }

//         return res.json({
//             ok: true,
//             deleteUser
//         });
//     });
// });

module.exports = app;