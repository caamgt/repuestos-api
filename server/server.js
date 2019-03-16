require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Configuración global de rutas
app.use(require('./routes/index'));

// Conexion a mongodb
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost:27017/repuestos', { useNewUrlParser: true }, (err, res) => {
    if (err) {
        throw err;
    }
    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
})