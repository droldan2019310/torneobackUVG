'user strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var mdAuth = require('../middlewares/authenticated');


var api = express.Router();

api.post('/login', userController.login); //login de todos los usuarios
api.post ('/saveUser',userController.saveUser);
api.put('/updateUser/:id', mdAuth.ensureAuth, userController.updateUser);
api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.getUsers);
api.put('/updateUserAdmin/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.updateUserAdmin);
api.post ('/saveUserAdmin',[mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],userController.saveUserAdmin);
api.put('/removeUser/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.removeUser);



module.exports = api;