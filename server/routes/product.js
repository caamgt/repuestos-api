const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Product = require('../models/product');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/products')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getMilliseconds() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        // Aceptar archivo
        cb(null, true)
    } else {
        // Rechazar archivos
        cb(null, false)
    }
}

const upload = multer({

    storage: storage,
    limits: {
        fileSize: 1 * 1024 * 1024
    },
    fileFilter
}).array('img', 3);

app.get('/products', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 30;
    limite = Number(limite);

    Product.find({ estado: true })
        .populate('marca categoria')
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

app.get('/repuesto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Product.findById(id)
        .populate('marca categoria')
        .exec((err, repuesto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                repuesto
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
        .or([{ nombre: regex }])
        .populate('marca categoria')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Product.countDocuments({ estado: true }, (err, totalProductos) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                } else {
                    return res.json({
                        ok: true,
                        productos,
                        totalProductos
                    });
                }
            })
        })
});

// ===============================
// Total de productos por marca
// ===============================
app.get('/productos/totalxmarca', verificaToken, (req, res) => {

    Product.aggregate([
            { $match: { estado: true } },
            { $lookup: { from: "marcas", localField: "marca", foreignField: "_id", as: "xmarcas" } },
            { $unwind: '$xmarcas' },
            { $group: { _id: "$xmarcas", totalPorMarca: { $sum: "$cantidad" } } },
            { $sort: { totalPorMarca: -1 } }
        ])
        .exec((err, totalXMarca) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Product.countDocuments({ estado: true }, (err, totalProductos) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                } else {
                    return res.json({
                        ok: true,
                        totalXMarca,
                        totalProductos
                    });
                }
            })
        });
});

// ===============================
// Total de productos por tipo
// ===============================
app.get('/productos/totalxcategoria', verificaToken, (req, res) => {

    Product.aggregate([
            { $match: { estado: true } },
            { $lookup: { from: "categorias", localField: "categoria", foreignField: "_id", as: "xcategoria" } },
            { $unwind: '$xcategoria' },
            { $group: { _id: "$xcategoria", totalPorCategoria: { $sum: "$cantidad" } } },
            { $sort: { totalPorCategoria: -1 } }
        ])
        .exec((err, totalXCategoria) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Product.countDocuments({ estado: true }, (err, totalProductos) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                } else {
                    return res.json({
                        ok: true,
                        totalXCategoria,
                        totalProductos
                    });
                }
            })
        });
});

// ===============================
// Gran total de productos
// ===============================
app.get('/productos/total', verificaToken, (req, res) => {

    Product.aggregate([
            { $match: { estado: true } },
            { $group: { _id: "$_id", total: { $sum: '$cantidad' } } },
        ])
        .exec((err, granTotal) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                granTotal
            });
        });
});

// =========================
// Registro de un producto
// =========================
app.post('/product', verificaToken, (req, res) => {
    upload(req, res, function(err) {
        if (err) {
            // An error occurred when uploading
            return res.status(400).json(err.message);
        }
        const body = req.body;

        const product = new Product({
            nombre: body.nombre,
            marca: body.marca,
            dimensiones: body.dimensiones,
            precio: body.precio,
            nota: body.nota,
            img: req.files,
            categoria: body.categoria,
            cantidad: body.cantidad,
            creator: req.usuario.id
        });

        return product.save()
            .then((productDB) => {
                return res.json({
                    ok: true,
                    productDB
                });
            })
            .catch(err => res.status(400).json(err))
    });

});

// ================================
// Actualizar imagen del producto
// ================================
app.put('/product/img/:id', verificaToken, (req, res) => {
    const id = req.params.id;

    upload(req, res, function(err) {
        if (err) {
            // An error occurred when uploading
            return res.status(400).json(err.message);
        }

        // Everything went fine
        Product.findByIdAndUpdate(id, { $set: { img: req.files } }, { new: true, runValidators: true }, (err, productDB) => {

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
    })

});

// =======================
// Actualizar Producto
// =======================
app.put('/product/:id', verificaToken, (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['nombre', 'marca', 'dimensiones', 'categoria', 'nota', 'cantidad', 'precio']);
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