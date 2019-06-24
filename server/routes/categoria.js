const express = require('express');
const Categoria = require('../models/categoria');
const { verificaToken } = require('../middlewares/autenticacion');
const _ = require('underscore');
const app = express();

app.get('/categorias', verificaToken, (req, res) => {

    Categoria.find({ estado: true })
        .sort('nombre')
        .populate({ path: 'modelo', Model: 'Modelo', populate: [{ path: 'linea', model: 'Linea', populate: { path: 'marca', model: 'Marca', select: 'nombre', codigo: 'codigo' } }] })
        .populate('creator', 'nombre')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Categoria.countDocuments({ estado: true }, (err, totalCategorias) => {
                if (err) {
                    return res.status.json({
                        ok: false,
                        err
                    });
                }
                return res.json({
                    ok: true,
                    categorias,
                    totalCategorias
                });
            });
        })
});

app.get('/categoria/:id', verificaToken, (req, res) => {
    const id = req.params.id;

    Categoria.findById(id)
        .populate('creator', 'nombre')
        .populate('linea')
        .exec((err, categoryDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se puede obtener la categoria'
                    }
                });
            }
            if (!categoryDB) {
                return res.status(400).json({
                    ok: false,
                    message: 'No existe la categoria'
                });
            }

            return res.json({
                ok: true,
                categoryDB
            });
        })
});

app.post('/categoria', verificaToken, (req, res) => {
    const body = req.body;

    const categoria = new Categoria({
        nombre: body.nombre,
        descripcion: body.descripcion,
        codigo: body.codigo,
        creator: req.usuario.id
    });

    categoria.save((err, categoryDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        return res.json({
            ok: true,
            categoryDB
        });
    });
});

app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'descripcion', 'estado']);

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoryDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se encontro la categoria'
                }
            });
        }
        if (!categoryDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'La categoria no existe'
                }
            });
        }

        return res.json({
            ok: true,
            categoryDB
        });
    })

});

app.delete('/categoria/:id', verificaToken, (req, res) => {
    const id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, deleteCategory) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe la categoria'
                }
            });
        }
        if (!deleteCategory) {
            return res.status(400).json({
                ok: false,
                message: 'No existe esta categoria'
            });
        }
        return res.json({
            ok: true,
            deleteCategory
        });
    })
});

module.exports = app;