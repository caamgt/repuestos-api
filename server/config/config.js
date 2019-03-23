// =========
// Port
// =========
process.env.PORT = process.env.PORT || 3000;

// ============
// Entorno
// ============
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ========================
// Vencimiento del token
// ========================
process.env.CADUCIDAD_TOKEN = '1h';

// ========================
// SEED de autenticación
// ========================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// ==============
// Base de datos
// ==============
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/repuestos';
} else {
    urlDB = 'mongodb://repadmin:Glt2019@ds159220.mlab.com:59220/repuestos-glt';
}

process.env.URLDB = urlDB;