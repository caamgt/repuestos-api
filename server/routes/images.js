const express = require('express');
const { verificaTokenImg } = require('../middlewares/autenticacion');
const fs = require('fs');
const path = require('path');

const app = express();

app.get('/image/:tipo/:img', verificaTokenImg, (req, res) => {
    const tipo = req.params.tipo;
    const img = req.params.img;

    const pathImage = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);


    if (fs.existsSync(pathImage)) {
        return res.sendFile(pathImage);
    } else {
        const noImagePath = path.resolve(__dirname, '../assets/no-imagen.png');
        res.sendFile(noImagePath);

    }
});

module.exports = app;