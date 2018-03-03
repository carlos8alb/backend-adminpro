var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// Obtener todos los medicos
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre usuario hospital')
        .skip(desde)
        .limit(5)
        .populate( 'usuario', 'nombre email' )
        .populate( 'hospital', 'nombre' )
        .exec(
        (err, medicos) => {

            if (err) {
                return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
            }

            Medico.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: count
                });
            });

        });

});

// Actualizar medico
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body

    Medico.findById(id, (err, medico) => {
      
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        };

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el medico con el id indicado'
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (!medicoGuardado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });


});

// Crear un medico
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear medico',
                        errors: err
                });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        });

    });
});

// Borrar un medico
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al borrar medico',
                        errors: err
                });
        };

        if (!medicoBorrado) {
            return res.status(400).json({
                        ok: false,
                        mensaje: 'No existe un medico con ese id'
                });
        };

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });

});

module.exports = app;