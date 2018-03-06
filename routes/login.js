var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

const GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;

//Autenticacion google
app.post('/google', (req, res) => {

    var token = req.body.token || '';
    const client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET);

    client.verifyIdToken(
        token,
        GOOGLE_CLIENT_ID,
        function(e, login){

            if (e) {
                return res.status(500).json({
                    ok: false,
                    errors: e,
                    token
                });
            }

            var payload = login.getPayload();
            var userId = payload['sub'];

            Usuario.findOne({email: payload.email}, (err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuario',
                        errors: err
                    });
                }
            });

            if (usuario) {
                if (usuario.google === false) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar su autenticacion normal',
                        errors: err
                    });
                } else {
                    // Crear un token
                    usuario.password = '';
                    var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400000 });

                    res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        token: token,
                        id: usuario.id
                    });                    
                }
            } else {
                // El usuario no existe por correo
                var usuario = new Usuario();

                usuario.nombre = payload.name;
                usuario.email = payload.email;
                usuario.password = bcrypt.hashSync(payload.sub, 10);
                usuario.img = payload.picture;
                usuario.google = true;                

                usuario.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al crear usuario',
                            errors: err
                        });
                    }
                    
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400000 });

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token
                    });

                });

            }

        }
    )

});

//Autenticacion normal
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioDB) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email'
            });
        }

        if (!bcrypt.compareSync( body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password'
            });
        }

        
        // Crear un token
        usuarioDB.password = '';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400000 });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });

    })

});

module.exports = app;