const User = require('../models/user');
const jwt = require('jsonwebtoken');
const redis = require('redis');

const redisClient = redis.createClient('//localhost:6379');

const handleSignin = (bcrypt, req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return Promise.reject('El usuario y la contraseña son necesarios');
    }
    return new Promise((resolve, reject) => {
        User.findOne({ email })
            .then((userDB) => {
                if (!bcrypt.compareSync(password, userDB.password)) {
                    return reject('Credenciales incorrectas');
                } else {
                    return resolve(userDB);
                }
            })
            .catch(err => reject('Credenciales incorrectas'))
    })
}

const getAuthTokenId = (req, res) => {
    const { authorization } = req.headers;
    return redisClient.get(authorization, (err, reply) => {
        if (err || !reply) {
            return res.status(400).json('No autorizado');
        }
        return res.json({ id: reply });
    })
}

const signinToken = (email, id, role) => {
    const jwtPayload = { email, id, role };
    return jwt.sign(jwtPayload, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN, algorithm: 'HS512' })
}

const setToken = (key, value) => {
    return Promise.resolve(redisClient.set(key, value, 'EX', 7200));
}

const createSession = (user) => {
    const { email, id, role } = user;
    const token = signinToken(email, id, role);
    return setToken(token, id)
        .then(() => {
            return { success: 'true', userId: id, token, role }
        })
        .catch(err => res.status(400).json(err))
}

const signinAuthotication = (bcrypt) => (req, res) => {
    const { authorization } = req.headers;
    return authorization ? getAuthTokenId(req, res) :
        handleSignin(bcrypt, req, res)
        .then(data => {
            return data.id && data.email ? createSession(data) : Promise.reject('Error con la data');
        })
        .then(session => {
            return res.json(session)
        })
        .catch(err => res.status(400).json(err))

}

module.exports = {
    signinAuthotication,
    redisClient
}