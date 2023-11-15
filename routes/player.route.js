'use strict'

var express = require('express');
var playerController = require('../controllers/player.controller');
var mdAuth = require('../middlewares/authenticated');


var api = express.Router();

api.post('/setPlayerToTeam/:id', playerController.setPlayerToTeam); //Guardar un jugador.
api.put('/updatePlayer/:id', playerController.updatePlayer); //Actualizar todos los datos de un jugador.
api.put('/removePlayer/:id', playerController.removePlayer); //Eliinar un jugador.
api.put('/updateMatchPlayer/:id', playerController.updateMatchPlayer); //Actualizarlos datos tras un partido de cada jugador.
api.get("/getPlayersTeam/:id", [mdAuth.ensureAuth],playerController.getPlayerTeam);
api.put('/updatePointPlayer/:id', playerController.updatePointsPlayer);
module.exports = api;