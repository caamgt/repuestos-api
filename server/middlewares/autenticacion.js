const jwt = require('jsonwebtoken');
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
        req.usuario = decoded.user;
        next();
    })
}

// ===================
// Verificar AdminRol
// ===================
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

module.exports = {
    verificaToken,
    verificaAdmin_Rol
}