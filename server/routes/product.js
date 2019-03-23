const express = require('express');
const Product = require('../models/product');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

app.get('/products', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.desde || 5;
    limite = Number(limite);

    Product.find({ estado: true })
        .populate('categoria', 'nombre')
        .sort('nombre')
        .skip(desde)
        .limit(limite)
        .exec((err, products) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Product.countDocuments({ estado: true }, (err, totalProducts) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                return res.json({
                    ok: true,
                    products,
                    totalProducts
                });
            });
        })
});

// ==================
// Buscar productos
// ==================
app.get('/products/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    // Se le pase la 'i', para que no sea sensible a minusculas y mayusculas.
    let regex = new RegExp(termino, 'i');
    Product.find({})
        .or([{ nombre: regex }, { marca: regex }])
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                productos
            });
        })
});

// =======================
// Registro de un producto
// =======================
app.post('/product', verificaToken, (req, res) => {
    const body = req.body;

    const product = new Product({
        nombre: body.nombre,
        marca: body.marca,
        linea: body.linea,
        modelo: body.modelo,
        nota: body.nota,
        categoria: body.categoria,
        cantidad: body.cantidad,
        creator: req.usuario.id
    });

    product.save((err, productDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        return res.json({
            ok: true,
            productDB
        });
    });
});

// =======================
// Actualizar Producto
// =======================
app.put('/product/:id', verificaToken, (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['nombre', 'marca', 'linea', 'modelo', 'nota']);

    Product.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            productDB
        });
    })
});

// =======================
// Deshabilitar Producto
// =======================
app.put('/habilitarproduct/:id', verificaToken, (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['estado']);

    Product.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Imposible obtener el producto'
                }
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                message: 'No existe este producto'
            });
        }
        return res.json({
            ok: true,
            productoDB
        });
    })
});

// ==============================
// Borrar Producto por ID
// ==============================
app.delete('/deleteproduct/:id', verificaToken, (req, res) => {
    const id = req.params.id;

    Product.findByIdAndRemove(id, (err, deleteProduct) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Este producto no existe'
                }
            });
        }
        if (!deleteProduct) {
            return res.status(400).json({
                ok: false,
                message: 'Este producto no existe'
            });
        }
        return res.json({
            ok: true,
            deleteProduct
        });
    })
});

// ==============================
// Deshabilitar Producto por ID
// ==============================
app.delete('/disableproduct/:id', verificaToken, (req, res) => {

    const id = req.params.id;
    let cambiarEstado = {
        estado: false
    }

    Product.findByIdAndUpdate(id, cambiarEstado, { new: true, runValidators: true }, (err, productoDesabilitado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'No se encontro el producto'
                }
            });
        }
        if (!productoDesabilitado) {
            return res.status(400).json({
                ok: false,
                message: 'Tiene que indicar el producto'
            });
        }
        return res.json({
            ok: true,
            productoDesabilitado
        });
    });
});

module.exports = app;