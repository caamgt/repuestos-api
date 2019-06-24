const express = require('express');
const Subcategoria = require('../models/subcategoria');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

app.get('/subcategorias', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.desde || 5;
    limite = Number(limite);

    Subcategoria.find({ estado: true })
        .populate('categoria', 'nombre descripcion')
        .sort('descripcion')
        .skip(desde)
        .limit(limite)
        .exec((err, subcategorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Subcategoria.countDocuments({ estado: true }, (err, totalSubcategorias) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                return res.json({
                    ok: true,
                    subcategorias,
                    totalSubcategorias
                });
            });
        })
});

app.post('/subcategoria', verificaToken, (req, res) => {
    const body = req.body;

    const subcategoria = new Subcategoria({
        descripcion: body.descripcion,
        categoria: body.categoria,
        creator: req.usuario.id
    });

    return subcategoria.save()
        .then(subcategoriaDB => {
            return res.json({
                ok: true,
                subcategoriaDB
            })
        })
        .catch(err => res.status(400).json({
            ok: false,
            err
        }))
});

module.exports = app;