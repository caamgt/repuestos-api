const express = require('express');
const fileUpload = require('express-fileupload');
const User = require('../models/user');
const Product = require('../models/product');
const { verificaToken } = require('../middlewares/autenticacion');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', verificaToken, (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    }

    // Validar tipo
    let tiposValidos = ['products', 'users'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', ')
            }
        });
    }
    let archivo = req.files.archivo;
    // Separar el nombre del archivo y la extensión.
    const nombreCortado = archivo.name.split('.');
    // Obtener la extensión.
    // -1 para obtener la ultima posicion.
    const extension = nombreCortado[nombreCortado.length - 1];

    // Extenciones permitidas
    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    // Cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        if (tipo === 'users') {
            return userImage(id, res, nombreArchivo);
        } else {
            return productImage(id, res, nombreArchivo);
        }
    });
});

userImage = (id, res, nombreArchivo) => {
    User.findById(id, (err, userDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'users');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!userDB) {
            borraArchivo(nombreArchivo, 'users');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }
        borraArchivo(userDB.img, 'users');

        userDB.img = nombreArchivo;
        userDB.save((err, saveUser) => {
            if (err) {
                borraArchivo(nombreArchivo, 'users');
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Imposible obtener el usuario'
                    }
                });
            }
            return res.json({
                ok: true,
                user: saveUser,
                img: nombreArchivo
            });
        });
    });
}

productImage = (id, res, nombreArchivo) => {
    Product.findById(id, (err, productDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'products');
            return res.status(500).json({
                ok: false,
                err: 'Producto no existe'
            });
        }
        if (!productDB) {
            borraArchivo(nombreArchivo, 'products');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }
        borraArchivo(productDB.img, 'products');

        productDB.img = nombreArchivo;

        productDB.save((err, saveProduct) => {
            if (err) {
                borraArchivo(nombreArchivo, 'products');
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No fue posible guardar el producto'
                    }
                });
            }
            return res.json({
                ok: true,
                product: saveProduct,
                img: nombreArchivo
            });
        })
    })
}

borraArchivo = (nombreImagen, tipo) => {
    // Verificar si la imagen existe en el file system.
    // Primero obtenemos la ruta.
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    // Verificamos si existe
    if (fs.existsSync(pathImagen)) {
        // Si exite lo borramos
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;