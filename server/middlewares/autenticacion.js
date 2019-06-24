const jwt = require('jsonwebtoken');
const redis = require('redis');
const redisClient = redis.createClient('http://localhost:6379');
// ===================
// Verificar token
// ===================
const verificaToken = (req, res, next) => {
    let authorization = req.query.authorization ? req.query.authorization : req.get('authorization');
    jwt.verify(authorization, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }
        req.usuario = decoded;
        next();
    })
}




// ====================
// Verificar AdminRol
// ====================
const verificaAdmin_Rol = (req, res, next) => {
    let usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            message: 'El usuario no es administrador'
        });
    }
}

// =============================
// Verificar token para imagen
// =============================
const verificaTokenImg = (req, res, next) => {
    const authorization = req.query.token;

    jwt.verify(authorization, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }
        req.usuario = decoded.user;
        next();
    })
}

module.exports = {
    verificaToken,
    verificaAdmin_Rol,
    verificaTokenImg
}