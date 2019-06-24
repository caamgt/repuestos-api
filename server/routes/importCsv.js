const express = require('express');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const csv = require('fast-csv');
const app = express();
const Product = require('../models/product');
const Marca = require('../models/marca');
const Categoria = require('../models/categoria');
const { verificaToken } = require('../middlewares/autenticacion');
const { uploadFiles } = require('../middlewares/uploadFiles');

app.post('/import', verificaToken, (req, res) => {

    uploadFiles(req, res, (err) => {
        if (req.file === undefined) {
            return res.status(400).json({
                ok: false,
                message: 'No se selecciono ningun archivo'
            });
        }
        if (err) {
            // An error occurred when uploading
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Algo paso'
                }
            });
        } else {
            const archivoProductos = req.file.path;
            const productList = [];

            const csvStream = csv
                .fromPath(archivoProductos, { headers: true, ignoreEmpty: true })
                .validate((data) => {
                    if (data.nombre === '' || data.marca === '' || data.categoria === '' || !mongoose.Types.ObjectId.isValid(data.marca) || !mongoose.Types.ObjectId.isValid(data.categoria)) {
                        return false;
                    } else {
                        return true;
                    }
                })
                .on("data-invalid", (data) => {
                    return 'El nombre es necesario';
                })
                .on("data", (data) => {
                    const product = new Product({
                        nombre: data.nombre,
                        marca: data.marca,
                        categoria: data.categoria,
                        nota: data.nota,
                        cantidad: data.cantidad,
                        precio: data.precio,
                        dimensiones: data.dimensiones
                    });
                    productList.push(data);
                    product.save((error) => {
                        if (error) {
                            borraArchivoCsv(req.file.filename);
                            throw error;
                        }
                    });

                }).on("end", (data) => {
                    fs.unlinkSync(req.file.path);
                    if (data === 0) {
                        return res.status(400).json('No se agregó ningún registro');
                    } else {
                        return res.json({
                            ok: true,
                            message: `Se guardaron ${data} productos exitosamente`,
                            productList
                        });
                    }
                });
        }
    });

});

borraArchivoCsv = (fileName) => {
    // Verificar si la imagen existe en el file system.
    // Primero obtenemos la ruta.
    let pathCsv = path.resolve(__dirname, `../../tmp/csv/${fileName}`);
    // Verificamos si existe
    if (fs.existsSync(pathCsv)) {
        // Si exite lo borramos
        fs.unlinkSync(pathCsv);
    }
}

module.exports = app;