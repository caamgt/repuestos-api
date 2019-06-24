const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();
const Marca = require('../models/marca');
const _ = require('underscore');

app.get('/marcas', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.desde || 5;
    limite = Number(limite);

    Marca.find({ estado: true })
        .populate('tipo', 'descripcion')
        .sort('nombre')
        .skip(desde)
        .limit(limite)
        .exec((err, marcas) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (!marcas) {
                return res.status(400).json({
                    ok: false,
                    message: 'No hay producto'
                });
            }
            Marca.countDocuments({ estado: true }, (err, totoalMarcas) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                return res.json({
                    ok: true,
                    marcas,
                    totoalMarcas
                });
            })

        })
});

app.get('/marca/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Marca.findById(id)
        .populate('tipo')
        .exec((err, marca) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                marca
            });
        })
})

app.post('/marca', verificaToken, (req, res) => {
    const body = req.body;

    const marca = new Marca({
        nombre: body.nombre,
        tipo: body.tipo,
        modelo: body.modelo,
        creator: req.usuario.id
    });

    return marca.save()
        .then((marcaDB) => {
            return res.json({
                ok: true,
                marcaDB
            });
        })
        .catch(err => res.status(400).json({ err }))
});

app.put('/marca/:id', verificaToken, (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['nombre', 'descripcion', 'estado', 'tipo']);

    Marca.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, marcaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!marcaDB) {
            return res.status(400).json({
                ok: false,
                message: 'No se encontro la marca'
            });
        }

        return res.json({
            ok: true,
            marcaDB
        });
    })
})

app.delete('/deletemarca/:id', verificaToken, (req, res) => {
    const id = req.params.id;
    let cambiarEstado = {
        estado: false
    }

    Marca.findByIdAndUpdate(id, cambiarEstado, { new: true, runValidators: true }, (err, marcaDesabilitada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!marcaDesabilitada) {
            return res.status(400).json({
                ok: false,
                message: 'No se indico el producto'
            });
        }
        return res.json({
            ok: true,
            marcaDesabilitada
        });
    })
});


module.exports = app;