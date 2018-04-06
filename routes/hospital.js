var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// Obtener todos los hospitales
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 0;
    desde = Number(desde);
    hasta = Number(hasta);

    Hospital.find({})
        .populate( 'usuario', 'nombre email' )
        .skip(desde)
        .limit(hasta)
        .sort({nombre: 1})
        .exec(
        (err, hospitales) => {

            if (err) {
                return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
            }

            Hospital.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: count
                });
            });

        });

});

// Obtener un hospital por ID
app.get('/:id', (req, res, next) => {

    var id = req.params.id;

    Hospital.findById(id)
        .populate( 'usuario', 'nombre email' )        
        .exec(
        (err, hospital) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital',
                    errors: err
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital solicitado no existe'
                });
            }

            return res.status(200).json({
                ok: true,
                hospital: hospital
            });

        });

});

// Actualizar hospital
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body

    Hospital.findById(id, (err, hospital) => {
      
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        };

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital con el id indicado'
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario;

        hospital.save((err, hospitalGuardado) => {
            if (!hospitalGuardado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });


});

// Crear un hospital
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear hospital',
                        errors: err
                });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario
        });

    });
});

// Borrar un hospital
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al borrar hospital',
                        errors: err
                });
        };

        if (!hospitalBorrado) {
            return res.status(400).json({
                        ok: false,
                        mensaje: 'No existe un hospital con ese id'
                });
        };

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });

});

module.exports = app;