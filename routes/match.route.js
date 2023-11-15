'use strict'

var express = require('express');
var matchController = require('../controllers/match.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();


api.post("/createMatch/:id",matchController.createMatch);
api.put('/removeMatch/:id', matchController.removeMatch); //Eliinar una sesión.
api.get("/getSession/:id", matchController.getSession);
api.get("/getMatch/:id", matchController.getMatches);
api.put('/setPoint/:id',matchController.setPoint); 
module.exports = api;