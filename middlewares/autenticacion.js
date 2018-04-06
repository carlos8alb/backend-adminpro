var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Verficar token

exports.verificaToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify( token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });
}

// Verficar user role

exports.verificaRole = function(req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - Role'
        });
    }
}