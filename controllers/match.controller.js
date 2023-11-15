'use strict'


var Match = require('../models/match.model');
var League = require('../models/league.model');
var Session = require('../models/session.model');
var Team = require('../models/team.model');

var robin = require('roundrobin');
var moment = require('moment');


function getSession(req, res){
    var leagueId = req.params.id;
    Session.find({leagues: leagueId}, (err, session)=>{
        if(err){
            return res.status(500).send({message: 'Error general'})
        }else if(session){
            return res.send({message:"se encontraron estas jornadas", session});
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    }).populate("matchs").populate("playersOne");
}

function getMatches(req, res){
    var leagueId = req.params.id;
    Match.find({leagues: leagueId}, (err, match)=>{
        if(err){
            return res.status(500).send({message: 'Error general'})
        }else if(match){
            return res.send({message:"se encontraron estos partidos", match});
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    }).populate("playersOne").populate("playersSecond");
}


function createMatch(req,res){
    var leagueId = req.params.id;
    let teamsLength = "";
    let teams = [];
    var params = req.body; //Pedir el numero de jornadas

    League.findById(leagueId, (err, leagueFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general'});
        }else if(leagueFind){

            teamsLength = Object.keys(leagueFind.teams).length;
            let p1 = ((teamsLength*(teamsLength-1))/2)/(teamsLength-1);
            let j1 = teamsLength-1;
            console.log(teamsLength)
            console.log(p1);
            console.log(j1);
           for (let i = 0; i < teamsLength; i++) {

               teams[i] = leagueFind.teams[i]; 
               console.log(teams[i]);
           }
 
            const robinMatches = robin(teamsLength, teams);                        

             //vacio = todas las jornadas;
             //[0] = una jornada en especifico; j1
             //[0][0] = un partido en especifico; p1
             //[0][0][0] = objectId de equipos; 0 o 1
            // generar jornadas nuevas cada vez que se ejecute esta funcion.

            var new_date = moment(params.date, "YYYY-MM-DD");

             for (let jornada = 0; jornada < j1; jornada++) {

                var session = new Session();
                                           
                var new_date2 = new_date.add(8,'days');


                session.name = "Jornada " + jornada;
                session.dateFirst = new_date2;
                session.dateSecond = new_date2;
                session.leagues = leagueId;

                session.save((err, sessionSaved)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general'})
                    }else if(sessionSaved){
                        League.findByIdAndUpdate(leagueId, {$push:{sessions: sessionSaved._id}}, {new: true}, (err, pushLeague)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general'});
                            }else if(pushLeague){
                                for (let partido = 0; partido < p1; partido++) {

                                    var match = new Match();
                
                                    match.playersOne = robinMatches[jornada][partido][0];
                                    match.playersSecond = robinMatches[jornada][partido][1];                    
                                    match.date = new_date2;
                                    match.leagues = leagueId;
                                    match.goalsFirst=0;
                                    match.goalsSecond=0;
                                    match.save((err, matchSaved)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general'});
                                        }else if(matchSaved){                                        
                                            Session.findByIdAndUpdate(sessionSaved._id, {$push:{matchs: matchSaved._id}}, {new: true}, (err, pushSession)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general'})
                                                }else if(pushSession){
        
                                                }else{
                                                    return res.status(404).send({message: 'Error al settear match'})
                                                }
                                            });        
                                        }else{
                                            return res.status(500).send({message: 'Error general al generar los partidos'});
                                        }
                                    })
                                }
                            }else{
                                return res.status(404).send({message: 'Error al settear liga'})
                            }
                        });
                    }else{
                        return res.status(404).send({message: 'Error al crear la jornada'});
                    }
                })
             }
             return res.send({message: 'Jornadas generadas exitosamente', date:"exito"});
        }else{
            return res.status(402).send({message: 'No se encontro ningun registro'});
        }
    });
}



function removeMatch(req, res){    
    var leagueId = req.params.id;
    let sessionLength = "";
    let session = [];

    Match.remove({leagues: leagueId}, (err, matchRemove)=>{
        if(err){
            return res.status(500).send({message: 'Error general'});
        }else if(matchRemove){            
            Session.remove({leagues: leagueId}, (err, sessionRemove)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'});
                }else if(sessionRemove){
                    League.findById(leagueId, (err, leagues)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general'});
                        }else if(leagues){
                
                        sessionLength = Object.keys(leagues.sessions).length;
                    
                           for (let i = 0; i < sessionLength; i++) {
                
                            session[i] = leagues.sessions[i]; 
                               League.findOneAndUpdate({_id: leagueId},{$pull: {sessions: leagues.sessions[i]}}, {new:true}, (err, sessionPull)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general'});
                                    }else if(sessionPull){

                                    }else{
                                        return res.status(402).send({message: 'No se encontro ningun registro'});
                                    }
                               });
                            }
                        }else{
                            return res.status(402).send({message: 'No se encontro ningun registro'});
                        }
                    });
                }else{
                    return res.status(402).send({message: 'No se encontro ningun registro'});
                }
            });
            return res.send({message: 'Se elimino correctamente', remove:"exito"});
        }else{
            return res.status(402).send({message: 'No se encontro ningun registro'});
        }
        
    }); 
}



function setPoint(req, res){
    var team = new Team();
    var match = new Match();
    let update = req.body;
    var matchId = req.params.id;
    // enviar los goles con los siguientes nombres:
    // goles primer Equipo  ---    goalsFirst
    // goles segundo equipo  ---    goalsSecond
    // confia en mi todo estara bien :)
    console.log(update)
    console.log(matchId)
    Match.findById(matchId, (err, matchFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general'});
        }else if(matchFind){
            Match.findByIdAndUpdate(matchFind._id, update, {new: true}, (err, matchUpdate)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al actualizar pepe'});
                }else if(matchUpdate){
                    Team.findById(matchFind.playersOne, (err, teamOne)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general'});
                        }else if(teamOne){

                            let d = Number.parseInt(update.goalsFirst) - Number.parseInt(update.goalsSecond);

                            if(d > 0){
                                //gano
                                console.log("Gano uno")
                                update.points = Number.parseInt(teamOne.points)+3;
                                update.PG = teamOne.PG+1;
                            }else if(d < 0){
                                //perdi
                                console.log("perdio uno")
                                update.PP = teamOne.PP+1;
                            }else{
                                //empate
                                console.log("empate uno")
                                update.points = Number.parseInt(teamOne.points)+1;
                                update.PE = teamOne.PE+1;
                            }
                            
                            update.PJ = Number.parseInt(teamOne.PJ)+1;
                            update.GF = Number.parseInt(teamOne.GF) + Number.parseInt(update.goalsFirst);
                            update.GC =  Number.parseInt(teamOne.GC) +  Number.parseInt(update.goalsSecond);
                            update.GD =    Number.parseInt(update.GF) -  Number.parseInt(update.GC);

                            Team.findByIdAndUpdate(matchFind.playersOne, update, {new: true}, (err, teamUpdate)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al actualizar'});
                                }else if(teamUpdate){

                                    update.points = 0;
                                    update.PJ = 0;
                                    update.PG = 0;
                                    update.PE = 0;
                                    update.PP = 0;
                                    update.GF = 0;
                                    update.GC = 0;
                                    update.GD = 0;

                                    Team.findById(matchFind.playersSecond, (err, teamTwo)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general'});
                                        }else if(teamTwo){
                
                                            let t = Number.parseInt(update.goalsSecond) - Number.parseInt(update.goalsFirst);
                
                                            if(t > 0){
                                                //gano
                                                console.log("Gano dos")
                                                update.points = Number.parseInt(teamTwo.points)+3;
                                                update.PG = teamTwo.PG+1;
                                            }else if(t < 0){
                                                //perdi
                                                console.log("Perdio dos")
                                                update.PP = teamTwo.PP+1;
                                            }else{
                                                //empate
                                                console.log("Empatado dos")
                                                update.points = Number.parseInt(teamTwo.points)+1;
                                                update.PE = teamTwo.PE+1;
                                            }
                                            
                                            update.PJ =  Number.parseInt(teamTwo.PJ)+1;
                                            update.GF =  Number.parseInt(teamTwo.GF) + Number.parseInt(update.goalsSecond);
                                            update.GC =  Number.parseInt(teamTwo.GC) +  Number.parseInt(update.goalsFirst);
                                            update.GD =  Number.parseInt(update.GF) -  Number.parseInt(update.GC);
                
                                            Team.findByIdAndUpdate(matchFind.playersSecond, update, {new: true}, (err, teamUpdate)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general al actualizar pepe3'});
                                                }else if(teamUpdate){
                                                    return res.send({message: 'Resultados cargados', teamUpdate});
                                                }else{
                                                    return res.send({message: 'No se pudo actualizar'});
                                                }
                                            });
                                        }else{
                                            return res.status(402).send({message: 'No se encontro ningun registro'});
                                        }
                                    });
                                }else{
                                    return res.send({message: 'No se pudo actualizar'});
                                }
                            });
                        }else{
                            return res.status(402).send({message: 'No se encontro ningun registro'});
                        }
                    });
                }else{
                    return res.send({message: 'No se pudo actualizar, intenta de nuevo'});
                }
            });
        }else{
            return res.status(402).send({message: 'No se encontro ningun registro'});
        }
    });
}




module.exports = {
    createMatch,
    removeMatch,
    setPoint,
    getSession,
    getMatches
}
