'use strict'

var Player = require('../models/player.model.js');
var Teams = require('../models/team.model.js');


function setPlayerToTeam(req, res){
    var teamId = req.params.id;
    var params = req.body;
    var player = new Player();


    if(params.name && params.lastname && params.dorsal && params.position){                
        player.name = params.name;
        player.lastname = params.lastname;
        player.dorsal = params.dorsal;
        player.position = params.position;
        player.goal = 0;
        player.cardA = 0;
        player.cardR = 0;
        player.cardT = 0;
        player.save((err, playerSaved)=>{
            if(err){
                return res.status(500).send({message: 'Error general'});
            }else if(playerSaved){
                Teams.findByIdAndUpdate(teamId, {$push:{players: playerSaved._id}}, {new: true}, (err, pushTeam)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al adjuntar jugador al equipo'});
                    }else if(pushTeam){
                        return res.send({message: 'Jugador creado y agregado', pushTeam, playerSaved});
                    }else{
                        return res.status(404).send({message: 'No se seteo el jugador, pero sí se creó en la BD'});
                    }
                }).populate('players')
            }else{
                return res.status(500).send({message: 'No se guardó el jugador'});
            }
        })
    }else{
        return res.status(401).send({message: 'Por favor envía los datos mínimos para la de tu jugador'})   
    }
}


function updatePlayer(req, res){
    let playerId = req.params.id;
    let update = req.body;

            if(update.name){
                Player.findOne({name: update.name}, (err, playerFind)=>{
                    if(err){
                        return res.status(500).send({ message: 'Error general'});
                    }else if(playerFind){
                        if(playerFind._id == playerId){   
                            Player.findByIdAndUpdate(playerId, update, {new: true}, (err, playerUpdate)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al actualizar'});
                                }else if(playerUpdate){
                                    return res.send({message: 'Jugador actualizado', playerUpdate});
                                }else{
                                    return res.send({message: 'No se pudo actualizar jugador'});
                                }
                            })
                        }else{
                            return res.send({message: 'Nombre de Jugador ya en uso'});    
                        }
                    }else{
                        Player.findByIdAndUpdate(playerId, update, {new: true}, (err, playerUpdate)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar'});
                            }else if(playerUpdate){
                                return res.send({message: 'Jugador actualizado', playerUpdate});
                            }else{
                                return res.send({message: 'No se pudo actualizar al jugador'});
                            }
                        })
                    }
                })
            }else{
                Player.findByIdAndUpdate(playerId, update, {new: true}, (err, hotelplayerUpdateUpdate)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al actualizar'});
                    }else if(playerUpdate){
                        return res.send({message: 'Jugador actualizado', playerUpdate});
                    }else{
                        return res.send({message: 'No se pudo actualizar al hotel'});
                    }
                })
            }
}


function removePlayer(req, res){
    let playerId = req.params.id;
    
    Player.findByIdAndRemove(playerId, (err, playerFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general'})
        }else if(playerFind){
            return res.send({message: 'Jugador eliminado', playerDrop:playerFind})
        }else{
            return res.status(404).send({message: 'Jugador no encontrado o ya eliminado'})
        }
    })
}

function getPlayerTeam(req, res){
    var id = req.params.id;

    Teams.findById(id, (err, teams)=>{
        if(err){
            return res.status(500).send({message: 'Error general'})
        }else if(teams){
            return res.send({message: 'Usuarios encontrados', teams})
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    }).populate("players");
}

function updateMatchPlayer(req, res){
    let playerId = req.params.id;
    let update = req.body;
             
        Player.findByIdAndUpdate(playerId, update, {new: true}, (err, playerUpdate)=>{
            if(err){
                return res.status(500).send({message: 'Error general al actualizar'});
            }else if(playerUpdate){
                return res.send({message: 'Jugador actualizado', playerUpdate});
            }else{
                return res.send({message: 'No se pudo actualizar jugador'});
            }
        })

        
}


function updatePointsPlayer(req, res){
    let playerId = req.params.id;
    let update = req.body;
        Player.findById(playerId, (err, playerFind)=>{
            if(err){
                console.log(err)
                return res.status(500).send({message: 'Error general al actualizar'});
            }else if(playerFind){
                update.goal = update.goal+playerFind.goal;
                update.cardA = update.cardA+playerFind.cardA;
                update.cardR = update.cardR + playerFind.cardR;
                update.cardT = playerFind.cardT+update.cardA+update.cardR;
                Player.findByIdAndUpdate(playerId, update, {new: true}, (err, playerUpdate)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al actualizar 1 '});
                    }else if(playerUpdate){
                        return res.send({message: 'Jugador actualizado', playerUpdate});
                    }else{
                        return res.send({message: 'No se pudo actualizar jugador'});
                    }
                })
            }else{
                return res.send({message: 'No se pudo actualizar jugador'});
            }
        })

        
}


module.exports = {
    setPlayerToTeam,
    updatePlayer,
    removePlayer,
    updateMatchPlayer,
    getPlayerTeam,
    updatePointsPlayer
}