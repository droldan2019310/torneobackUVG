'use strict'

var Player = require('../models/player.model.js');
var Team = require('../models/team.model.js');
var League = require('../models/league.model.js');
var fs = require('fs');
var path = require('path');


function saveTeam(req, res){
    var params = req.body;
    var team = new Team();

    if(params.name){        
        Team.findOne({name:params.name}, (err, teamFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'})
            }else if(teamFind){
                return res.send({message: 'Este nombre no está disponible'})
            }else{
                team.name = params.name;
                team.GC = 0;
                team.GD = 0;
                team.GF = 0;
                team.PE = 0;
                team.PG = 0;
                team.PJ =0;
                team.PP =0;
                team.points =0;
                team.save((err, saveTeam)=>{
                    if(err){
                        return res.status(500).send({message: 'Error en la base de datos'});
                    }else if(saveTeam){
                        return res.send({message: 'Creado exitosamente', saveTeam});
                    }else{
                        return res.status(500).send({message: 'No se pudo guardar'});
                    }
                })
            }
        })
    }
}


function updateTeam(req, res){
    let teamId = req.params.id;
    let update = req.body;


    if(update.points || update.PJ || update.PG || update.PE || update.PP || update.GF || update.GC || update.GD){
        return res.status(401).send({ message: 'No puede actualizar estos datos desde esta función'});
    }else{
        Team.findOne({name: update.name}, (err, teamFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al actualizar'});
            }else if(teamFind){
                return res.send({message: 'Nombre no disponible'});
            }else{            
                Team.findByIdAndUpdate(teamId, update, {new: true}, (err, teamUpdate)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al actualizar'});
                    }else if(teamUpdate){
                        return res.send({message: 'Equipo Actualizado', teamUpdate});
                    }else{
                        return res.send({message: 'No se pudo actualizar, intenta de nuevo'});
                    }
                })
            }
        })    
    }
}

function removeTeam(req, res){
    let teamId = req.params.id;

    Team.findByIdAndRemove(teamId, (err, teamRemove)=>{
        if(err){
            res.status(500).send({message: 'Error en el servidor'});
        }else if(teamRemove){
            res.status(200).send({message: 'Equipo eliminado', userRemoved});
        }else{
            res.status(200).send({message: 'No existe este equipo'});
        }
    })
}

function uploadTeam(req, res){    
    var teamId = req.params.id;
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
                    Team.findByIdAndUpdate(teamId, {logo: fileName}, {new:true}, (err, teamUpdate)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general'});
                        }else if(teamUpdate){
                            return res.send({team: teamUpdate, teamImage: teamUpdate.teamUpdate});
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

function getImageTeam(req, res){
    var fileName = req.params.fileName;
    var pathFile = './uploads/teams/' + fileName;
    fs.exists(pathFile, (exists)=>{
        if(exists){                    
            return res.sendFile(path.resolve(pathFile))
        }else{
           return res.status(404).send({message: 'Imagen inexistente'});
        }
    })
}

function findTeam(req,res){
    var params = req.body;

    Team.findOne({name:params.name}, (err, teamFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general'});
        }else if(teamFind){
            return res.send({message: 'Equipo encontrado', teamFind});
        }else{
            return res.send({message: 'Equipo no encontrado'});
        }
    })
}


function setTeamLeague(req,res){
    var leagueId = req.params.id;
    var params = req.body;

    League.findById(leagueId, (err, leagueFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general en el servidor'});
        }else if(leagueFind){
            
            League.findByIdAndUpdate(leagueId, {$push:{teams: params._id}}, {new: true}, (err, pushLeague)=>{
                if(err){
                    return res.status(500).send({message: "error general"});
                }else if(pushLeague){
                    return res.send({message: 'se agrego el equipo correctamente', pushLeague});
                }else{
                    return res.status(404).send({message: 'No se seteo a la liga'});
                }
            })
            
        }else{
            return res.status(401).send({message: 'Equipo no encontrado'});
        }

    })
}


function getLeagueTeam(req, res){
    var id = req.params.id;

    League.findById(id, (err, ls)=>{
        if(err){
            return res.status(500).send({message: 'Error general'})
        }else if(ls){
            return res.send({message: 'Ligas encontrados', ls})
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    }).populate("teams");
}


function getTeams(req, res){

    Team.find({}).exec((err, teams)=>{
        if(err){
            return res.status(500).send({message: 'Error general'})
        }else if(teams){
            return res.send({message: 'Equipos encontrados', teams})
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    })
}

function getTeam(req, res){
    var id = req.params.id;
    Team.findById(id, (err, team)=>{
        if(err){
            return res.status(500).send({message: 'Error general'})
        }else if(team){
            
            return res.send({message: 'Equipos encontrados', team})
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    }).populate("players")
}

function listaPosition(req, res){
    //var mysort = { teams: -1 };
    let leagueId = req.params.id;

    League.findById(leagueId, (err,teamFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general'});
        }else if(teamFind){
            Team.find({_id:teamFind.teams}, (err, teams)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'});
                }else if(teams){
                    return res.send({message: 'datos: ', teams});
                }else{
                    return res.status(500).send({message: 'No se encontraron datos'});
                }
            }).sort({points:-1}).sort({GD:-1})
        }else{
            return res.status(500).send({message: 'No se encontraron datos'});
        }
    });
}

module.exports = {
    saveTeam,
    updateTeam,
    removeTeam,
    uploadTeam,
    getImageTeam,
    findTeam,
    setTeamLeague,
    getLeagueTeam,
    getTeams,
    listaPosition,
    getTeam

}