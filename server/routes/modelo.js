const express = require('express');
const Modelo = require('../models/modelo');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

app.get('/modelos', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.desde;
    limite = Number(limite);

    Modelo.find()
        .populate({ path: 'linea', model: 'Linea', select: 'nombre', populate: [{ path: 'marca', model: 'Marca', select: 'nombre', populate: { path: 'tipo', model: 'Tipo', select: 'descripcion' } }] })
        .sort('linea')
        .skip(desde)
        .limit(limite)
        .exec((err, modelos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (!modelos) {
                return res.status(400).json({
                    ok: false,
                    message: 'No hay producto'
                });
            }
            Modelo.countDocuments({ estado: true }, (err, totoalModelos) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                return res.json({
                    ok: true,
                    modelos,
                    totoalModelos
                });
            })
        })
});

app.get('/modelos/buscar', verificaToken, (req, res) => {

    const buscarPorLinea = req.body.linea;

    Modelo.find({ 'linea': buscarPorLinea })
        .populate({ path: 'linea', model: 'Linea', populate: [{ path: 'marca', model: 'Marca' }] })
        .exec((err, modelos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                modelos
            });
        })
});

app.post('/modelo', verificaToken, (req, res) => {
    const body = req.body;

    const modelo = new Modelo({
        descripcion: body.descripcion,
        linea: body.linea,
        creator: req.usuario.id
    });

    return modelo.save()
        .then(modeloDB => {
            return res.json({
                ok: true,
                modeloDB
            });
        })
        .catch(err => res.status(400).json(err));
});

module.exports = app;