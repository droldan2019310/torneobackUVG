'use strict'

var express = require('express');
var teamController = require('../controllers/team.controller');
var mdAuth = require('../middlewares/authenticated');

var connectMultiparty = require('connect-multiparty');
var mdUpload = connectMultiparty({ uploadDir: './uploads/teams'});
var api = express.Router();

var api = express.Router();

api.post ('/saveTeam', teamController.saveTeam);
api.put('/updateTeam/:id', teamController.updateTeam);
api.put('/removeTeam', teamController.removeTeam);
api.put('/uploadTeam/:id',[mdUpload] ,teamController.uploadTeam);
api.get("/getImageTeam/:fileName",[mdUpload],teamController.getImageTeam);
api.post ('/findTeam', teamController.findTeam);
api.put('/setTeamLeague/:id', teamController.setTeamLeague);
api.get("/getLeagueTeam/:id", [mdAuth.ensureAuth], teamController.getLeagueTeam );
api.get("/getTeams", [mdAuth.ensureAuth, mdAuth.ensureAuthAdminLeague],teamController.getTeams);
api.get("/listaPosition/:id", teamController.listaPosition);

api.get("/getTeam/:id", [mdAuth.ensureAuth, mdAuth.ensureAuthAdminLeague],teamController.getTeam);


module.exports = api;