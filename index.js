'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;
var userInit = require('./controllers/user.controller');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TorneoDeportivo', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log('Conectado a DB');
        app.listen(port, ()=>{
            console.log('Servidor de express corriendo');
            userInit.createInit();
        })
    })
    .catch((err)=>console.log('Error al conectarse a la DB', err))