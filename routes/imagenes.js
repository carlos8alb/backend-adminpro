var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathFile = `./uploads/${ tipo }/${ img }`;
    
    if(!fs.existsSync(pathFile)){
        pathFile = './assets/no-img.jpg';
    }
    res.sendFile(path.resolve(pathFile));
    
});

module.exports = app;