const express = require('express');
const Tipo = require('../models/tipo');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();
const _ = require('underscore');

app.get('/tipos', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.desde || 5;
    limite = Number(limite);

    Tipo.find({ estado: true })
        .sort('descripcion')
        .skip(desde)
        .limit(limite)
        .exec((err, tipos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (!tipos) {
                return res.status(400).json({
                    ok: false,
                    message: 'No hay producto'
                });
            }
            Tipo.countDocuments({ estado: true }, (err, totoalTipos) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                return res.json({
                    ok: true,
                    tipos,
                    totoalTipos
                });
            })
        })

});

app.get('/tipo/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Tipo.findById(id)
        .exec((err, tipo) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                tipo
            });
        })
})

app.post('/tipo', verificaToken, (req, res) => {
    const body = req.body;

    const tipo = new Tipo({
        descripcion: body.descripcion,
        nota: body.nota,
        creator: req.usuario.id
    });

    return tipo.save()
        .then(tipoDB => {
            return res.json({
                ok: true,
                tipoDB
            });
        })
        .catch(err => res.status(400).json('Imposible agregar el tipo'))
});

app.put('/tipo/:id', verificaToken, (req, res) => {
    const id = req.params.id;

    const body = _.pick(req.body, ['descripcion', 'nota']);

    Tipo.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, tipoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!tipoDB) {
            return res.status(400).json({
                ok: false,
                message: 'No se encontro el tipo'
            });
        }

        return res.json({
            ok: true,
            tipoDB
        });
    })
})

app.delete('/deletetipo/:id', verificaToken, (req, res) => {
    const id = req.params.id;
    let cambiarEstado = {
        estado: false
    }

    Tipo.findByIdAndUpdate(id, cambiarEstado, { new: true, runValidators: true }, (err, tipoDesabilitado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!tipoDesabilitado) {
            return res.status(400).json({
                ok: false,
                message: 'No se indico el producto'
            });
        }
        return res.json({
            ok: true,
            tipoDesabilitado
        });
    })
})

module.exports = app;