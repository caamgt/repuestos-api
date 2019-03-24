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
app.use(require('./category'));
app.use(require('./upload'));
app.use(require('./images'));


module.exports = app;