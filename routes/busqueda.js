var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Busqueda especifica
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    // Expresion regular para buscar en la cadena de caracteres
    var regExp = new RegExp( busqueda, 'i' );

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regExp);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regExp);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regExp);
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son usuarios, medicos y hospitales'
            });
    }

    promesa.then( data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});

// Busqueda general
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    // Expresion regular para buscar en la cadena de caracteres
    var regExp = new RegExp( busqueda, 'i' );

    Promise.all([
        buscarHospitales(busqueda, regExp),
        buscarMedicos(busqueda, regExp),
        buscarUsuarios(busqueda, regExp)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    })

});

function buscarHospitales(busqueda, regExp) {

    return new Promise( (resolve, reject) => {
        Hospital.find({nombre: regExp})
                .populate('usuario', 'nombre email')
                .exec((err, hospitales) => {
                    if (err) {
                        reject('Error al cargar hospitales');
                    } else {
                        resolve(hospitales);
                    }
                });
    });

}

function buscarMedicos(busqueda, regExp) {

    return new Promise( (resolve, reject) => {
        Medico.find({nombre: regExp})
              .populate('usuario', 'nombre email')
              .populate('hospital', 'nombre')
              .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar hospitales');
                } else {
                    resolve(medicos);
                }
              });
    });

}

function buscarUsuarios(busqueda, regExp) {

    return new Promise( (resolve, reject) => {
        Usuario.find({}, 'nombre email role')
               .or([ {nombre: regExp}, {email: regExp} ])
               .exec((err, usuarios) => {
                    if (err) {
                        reject('Error al cargar usuario');
                    } else {
                        resolve(usuarios);
                    }
               });
    });

}


module.exports = app;