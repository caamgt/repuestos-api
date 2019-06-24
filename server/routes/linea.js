const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();
const Linea = require('../models/linea');
const _ = require('underscore');


app.get('/lineas', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.desde || 5;
    limite = Number(limite);

    Linea.find()
        .populate({ path: 'marca', select: 'nombre' })
        .sort('nombre')
        .skip(desde)
        .limit(limite)
        .exec((err, lineas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Linea.countDocuments({ estado: true }, (err, totalLineas) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                return res.json({
                    ok: true,
                    lineas,
                    totalLineas
                });
            });
        })
});
app.post('/linea', verificaToken, (req, res) => {
    const body = req.body;

    const linea = new Linea({
        nombre: body.nombre,
        marca: body.marca,
        creator: req.usuario.id
    })

    return linea.save()
        .then(lineaDB => {
            return res.json({
                ok: true,
                lineaDB
            });
        })
        .catch(err => res.status(400).json(err))
});

module.exports = app;