'use strict'

var express = require('express');
var leagueController = require('../controllers/league.controller');
var mdAuth = require('../middlewares/authenticated');

var connectMultiparty = require('connect-multiparty');
var mdUpload = connectMultiparty({ uploadDir: './uploads/leagues'});
var api = express.Router();

api.post ('/saveLeague', leagueController.saveLeague);
api.put('/updateLeague/:id', leagueController.updateLeague);
api.put('/removeLeague/:id', leagueController.removeLeague);
api.put('/uploadLeague/:id',[mdUpload] ,leagueController.uploadLeague);
api.post ('/findLeague', leagueController.findLeague);
api.put('/setUserLeague/:id', leagueController.setUserLeague);
api.get("/getLeagues", [mdAuth.ensureAuth, mdAuth.ensureAuthAdminLeague],leagueController.getLeagues);
api.get("/getImageLeague/:fileName",[mdUpload],leagueController.getImageLeague);
api.get("/getLeagueUser/:id", [mdAuth.ensureAuth], leagueController.getUserLeague );

module.exports = api;