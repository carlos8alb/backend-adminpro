var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion
    var tipoValidos = ['hospitales', 'medicos', 'usuarios'];
    if ( tipoValidos.indexOf( tipo ) < 0 ) {
        return  res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida'
        });
    }

    if (!req.files) {
        return  res.status(400).json({
            ok: false,
            mensaje: 'No selecionó ninguna imagen'
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;

    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];    

    var extensionesValidas = ['png', 'gif', 'jpg', 'jpeg'];
    if ( extensionesValidas.indexOf( extensionArchivo ) < 0 ) {
        return  res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida'
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover archivo a un path temporal
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;    
    
    subirPorTipo(tipo, id, nombreArchivo, res, archivo, path);    

});

function subirPorTipo(tipo, id, nombreArchivo, res, archivo, path) {
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {
            if (err) {
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'Error al obtener usuario'
                }); 
            }

            if (!usuario) {
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'El usuario no existe'
                }); 
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Elimina si existe la imagen anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                if (err) {
                    return  res.status(500).json({
                        ok: false,
                        mensaje: 'Error al obtener usuario'
                    }); 
                }

                usuarioActualizado.password = '';

                moverArchivo(archivo, path);

                return  res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuarioActualizado: usuarioActualizado
                }); 

            });

        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {
            if (err) {
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'Error al obtener medico'
                }); 
            }

            if (!medico) {
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'El medico no existe'
                }); 
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Elimina si existe la imagen anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;
            
            medico.save((err, medicoActualizado) => {
                if (err) {
                    return  res.status(500).json({
                        ok: false,
                        mensaje: 'Error al obtener medico'
                    }); 
                }                

                moverArchivo(archivo, path);

                return  res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medicoActualizado: medicoActualizado
                });

            });

        });
        
    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'Error al obtener hospital'
                }); 
            }

            if (!hospital) {
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'El hospital no existe'
                }); 
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Elimina si existe la imagen anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return  res.status(500).json({
                        ok: false,
                        mensaje: 'Error al obtener hospital'
                    }); 
                }

                moverArchivo(archivo, path);

                return  res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospitalActualizado: hospitalActualizado
                }); 

            });

        });
        
    }
}

function moverArchivo(archivo, path){
    archivo.mv(path, (err) => {

        if (err) {
            return  res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            }); 
        }
        
    });
}

module.exports = app;