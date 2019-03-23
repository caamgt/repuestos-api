const express = require('express');
const Category = require('../models/category');
const { verificaToken } = require('../middlewares/autenticacion');
const _ = require('underscore');
const app = express();

app.get('/categorias', verificaToken, (req, res) => {

    Category.find({ estado: true })
        .sort('nombre')
        .populate('creator', 'nombre')
        .exec((err, categorys) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Category.countDocuments({ estado: true }, (err, totalCategorys) => {
                if (err) {
                    return res.status.json({
                        ok: false,
                        err
                    });
                }
                return res.json({
                    ok: true,
                    categorys,
                    totalCategorys
                });
            });
        })
});

app.get('/categoria/:id', verificaToken, (req, res) => {
    const id = req.params.id;

    Category.findById(id)
        .populate('creator', 'nombre')
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

    const category = new Category({
        nombre: body.nombre,
        descripcion: body.descripcion,
        creator: req.usuario.id
    });

    category.save((err, categoryDB) => {
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

    Category.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoryDB) => {
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

    Category.findByIdAndRemove(id, (err, deleteCategory) => {
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