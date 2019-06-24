const User = require('../models/user');
const _ = require('underscore');
const handleProfileGet = (req, res) => {
    const { id } = req.params;

    return User.findById(id, (err, user) => {
        if (err) {
            return res.status(400).json({
                Ok: false,
                message: 'Error al obtener el perfil'
            })
        }
        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'No existe el usuario'
            });
        } else {
            return res.json({
                ok: true,
                user
            });
        }
    });
}

const handleProfileUpdate = (req, res) => {
    const { id } = req.params;
    const body = _.pick(req.body, ['nombre', 'img']);
    return User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, user) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Imposible actualizar al usuario'
            });
        }
        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'No se encontro el usuario'
            });
        } else {
            return res.json({
                ok: true,
                user
            });
        }
    })
}

module.exports = {
    handleProfileGet,
    handleProfileUpdate
}