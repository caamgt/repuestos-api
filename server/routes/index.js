const express = require('express')
const app = express();

app.get('/', (req, res) => {
    res.json({
        ok: true,
        message: "The app is working!"
    });
});
app.use(require('./login'));
app.use(require('./user'));
app.use(require('./product'));
app.use(require('./categoria'));
app.use(require('./importCsv'));
app.use(require('./images'));
app.use(require('./profile'));
app.use(require('./marca'));
app.use(require('./linea'));
app.use(require('./tipo'));
app.use(require('./modelo'));
app.use(require('./subcategoria'));
app.use(require('./upload'));


module.exports = app;