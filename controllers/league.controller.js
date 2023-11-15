'use strict'

var League = require('../models/league.model');
var User = require('../models/user.model');
var fs = require('fs');
var path = require('path');

function saveLeague(req, res){
    var params = req.body;
    var league = new League();
    if(params.name && params.season && params.description){        
        League.findOne({name:params.name}, (err, leagueFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'})
            }else if(leagueFind){
                return res.send({message: 'Este nombre no está disponible'})
            }else{
                league.name = params.name;
                league.season = params.season;
                league.description = params.description;

                league.save((err, saveLeague)=>{
                    if(err){
                        return res.status(500).send({message: 'Error en la base de datos'});
                    }else if(saveLeague){
                        return res.send({message: 'Creado exitosamente', saveLeague});
                    }else{
                        return res.status(500).send({message: 'No se pudo guardar'});
                    }
                })
            }
        })
    }
}


function updateLeague(req, res){
    let leagueId = req.params.id;
    let update = req.body;

    if(update.name){
        return res.status(401).send({ message: 'No puede actualizar el nombre desde esta función'});
    }else{
        League.findByIdAndUpdate(leagueId, update, {new: true}, (err, leagueUpdate)=>{
            if(err){
                return res.status(500).send({message: 'Error general al actualizar'});
            }else if(leagueUpdate){
                return res.send({message: 'Liga Actualizada', leagueUpdate});
            }else{
                return res.send({message: 'No se pudo actualizar, intenta de nuevo'});
            }
        })
        }
}


function removeLeague(req, res){
    let leagueId = req.params.id;

    League.findByIdAndRemove(leagueId, (err, removeLeague)=>{
        if(err){
            res.status(500).send({message: 'Error en el servidor'});
        }else if(removeLeague){
            res.status(200).send({message: 'Liga eliminado', removeLeague});
        }else{
            res.status(200).send({message: 'No existe esta liga'});
        }
    })
}


function uploadLeague(req, res){    
    var leagueId = req.params.id;
    var fileName = 'Sin imagen';

        if(req.files){
            //captura la ruta de la imagen
            var filePath = req.files.image.path;
            //separa en indices cada carpeta
            //si se trabaja en linux ('\');
            var fileSplit = filePath.split('\\');
            //captura el nombre de la imagen
            var fileName = fileSplit[2];

            var ext = fileName.split('\.');
            var fileExt = ext[1];

            if( fileExt == 'png' ||
                fileExt == 'jpg' ||
                fileExt == 'jpeg' ||
                fileExt == 'gif'){
                    League.findByIdAndUpdate(leagueId, {logo: fileName}, {new:true}, (err, leagueUpdate)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general'});
                        }else if(leagueUpdate){
                            return res.send({league: leagueUpdate, leagueImage: leagueUpdate.leagueUpdate});
                        }else{
                            return res.status(404).send({message: 'No se actualizó'});
                        }
                    })
                }else{
                    fs.unlink(filePath, (err)=>{
                        if(err){
                            return res.status(500).send({message: 'Error al eliminar y la extensión no es válida'});
                        }else{
                            return res.status(403).send({message: 'Extensión no válida, y archivo eliminado'});
                        }
                    })
                }
        }else{
            return res.status(404).send({message: 'No has subido una imagen'});
        }
}


function getImageLeague(req, res){
    var fileName = req.params.fileName;
    var pathFile = './uploads/leagues/' + fileName;
    fs.exists(pathFile, (exists)=>{
        if(exists){                    
            return res.sendFile(path.resolve(pathFile))
        }else{
           return res.status(404).send({message: 'Imagen inexistente'});
        }
    })
}

function findLeague(req,res){
    var params = req.body;

    League.findOne({name:params.name}, (err, leagueFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general'});
        }else if(leagueFind){
            return res.send({message: 'Liga encontrada', leagueFind});
        }else{
            return res.send({message: 'Liga no encontrada'});
        }
    })
}

function getUserLeague(req, res){
    var id = req.params.id;

    User.findById(id, (err, users)=>{
        if(err){
            return res.status(500).send({message: 'Error general'})
        }else if(users){
            return res.send({message: 'Usuarios encontrados', users})
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    }).populate("leagues");
}



//Setear usuarios a hotels
function setUserLeague(req,res){
    var userId = req.params.id;
    var params = req.body;

    User.findById(userId, (err, userFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general en el servidor'});
        }else if(userFind){
            
            User.findByIdAndUpdate(userId, {$push:{leagues: params._id}}, {new: true}, (err, pushUser)=>{
                if(err){
                    return res.status(500).send({message: "error general"});
                }else if(pushUser){
                    return res.send({message: 'se agrego el torneo correctamente', pushUser});
                }else{
                    return res.status(404).send({message: 'No se seteo el usuario'});
                }
            })
            
        }else{
            return res.status(401).send({message: 'Usuario no encontrado'});
        }

    })
}

function getLeagues(req, res){
    League.find({}).exec((err, leagues)=>{
        if(err){
            return res.status(500).send({message: 'Error general'})
        }else if(leagues){
            return res.send({message: 'Ligas encontradas', leagues})
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    })
}

module.exports = {
    saveLeague,
    updateLeague,
    removeLeague,
    uploadLeague,
    getImageLeague,
    findLeague,
    setUserLeague,
    getLeagues,
    getUserLeague
}