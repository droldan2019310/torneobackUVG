'use strict'
var League = require('../models/league.model')
var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function createInit(req,res){
    var adminName= 'Admin';
    var adminUserName = 'Admin';
    var adminPassword = '12345';
    var role = 'ROLE_ADMINLEAGUE';
    var user = new User();
    User.findOne({username: adminUserName},(err,userFind)=>{
        if(err){
            console.log("error general",err);
        }else if(userFind){
            console.log("usuario ya existe, Usuario:Admin, password:12345");
        }else{
            bcrypt.hash(adminPassword,null,null,(err, passwordHash)=>{
                if(err){
                    console.log("error general al encriptar",err);
                }else if(passwordHash){
                    user.name = adminName;
                    user.username = adminUserName;
                    user.password= passwordHash;
                    user.role = role;
                    user.save((err,userSaved)=>{
                        if(err){
                            console.log("error general al guardar",err);
                        }else if(userSaved){
                            console.log("usuario creado, Usuario:Admin, password:12345");
                        }else{
                            console.log("no se pudo guardar el usuario");
                        }
                    })
                }else{
                    console.log("no se pudo encriptar");
                }
            })
        }
    })
}

function login(req, res){
    var params = req.body;
    
    if(params.username && params.password){
        User.findOne({username: params.username}, (err,userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al comparar contraseñas'});
                    }else if(checkPassword){
                        if(params.getToken){
                            res.send({
                                token: jwt.createToken(userFind),
			                	user: userFind
                            })
                        }else{
                            return res.send({message: 'Usuario logeado'});
                        }
                    }else{
                        return res.status(403).send({message: 'Usuario o contraseña incorrectos'});
                    }
                })
            }else{
                return res.status(401).send({message: 'Cuenta de usuario no encontrada'});
            }
        })

    }else{
        return res.status(404).send({message: 'Por favor envía los campos obligatorios'});
    }
}


function saveUser(req, res){
    var user = new User();
    var params = req.body;

    if(params.name && params.username && params.email && params.password){
        User.findOne({username:params.username},(err,userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'})
            }else if(userFind){
                return res.send({message: 'Nombre de usuario no disponible'})
            }else{
                bcrypt.hash(params.password, null, null,(err,passwordHash)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al comparar contraseña'})
                    }else if(passwordHash){
                        user.password = passwordHash;
                        user.name = params.name;
                        user.lastname = params.lastname;
                        user.username = params.username;
                        user.email = params.email;
                        user.phone = params.phone;
                        user.role = params.role; //Opciones: 'ROLE_USER'                      

                        if((params.role != 'ROLE_USER')){
                            return res.status(401).send({message: 'No tiene permiso para  crear este tipo de usuario.'});
                        }else{
                            user.save((err, userSaved)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al guardar usuario'});
                                }else if(userSaved){
                                    return res.send({message: 'Usuario creado exitosamente', userSaved});
                                }else{
                                    return res.status(500).send({message: 'No se guardó el usuario'});
                                }
                            })
                        }
                    }else{
                        return res.status(403).send({message: 'La contraseña no se ha encriptado'});
                    }
                })
            }
        })
    }else{
        return res.status(403).send({message: 'Ingrese los datos obligatorios'});     
    }
}

function updateUser(req, res){
    let userId = req.params.id;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(401).send({ message: 'No tienes permiso para realizar esta acción'});
    }else{
        if(update.password || update.role){
            return res.status(401).send({ message: 'No se puede actualizar la contraseña ni el rol desde esta función'});
        }else{
            if(update.username){
                User.findOne({username: update.username.toLowerCase()}, (err, userFind)=>{
                    if(err){
                        return res.status(500).send({ message: 'Error general'});
                    }else if(userFind){
                        if(userFind._id == req.user.sub){
                            User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al actualizar'});
                                }else if(userUpdated){
                                    return res.send({message: 'Usuario actualizado', userUpdated});
                                }else{
                                    return res.send({message: 'No se pudo actualizar al usuario'});
                                }
                            })
                        }else{
                            return res.send({message: 'Nombre de usuario ya en uso'});
                        }
                    }else{
                        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar'});
                            }else if(userUpdated){
                                return res.send({message: 'Usuario actualizado', userUpdated});
                            }else{
                                return res.send({message: 'No se pudo actualizar al usuario'});
                            }
                        })
                    }
                })
            }else{
                User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al actualizar'});
                    }else if(userUpdated){
                        return res.send({message: 'Usuario actualizado', userUpdated});
                    }else{
                        return res.send({message: 'No se pudo actualizar al usuario'});
                    }
                })
            }
        }
    }
    
}

function getUsers(req, res){
    User.find({}).exec((err, users)=>{
        if(err){
            return res.status(500).send({message: 'Error general'})
        }else if(users){
            return res.send({message: 'Usuarios encontrados', users})
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    })
}


function updateUserAdmin(req, res){
    let userId = req.params.id;
    let update = req.body;
    if(update.password){
        return res.status(401).send({ message: 'No se puede actualizar la contraseña  desde esta función'});
    }else{
        if(update.username){
            User.findOne({username: update.username.toLowerCase()}, (err, userFind)=>{
                if(err){
                    return res.status(500).send({ message: 'Error general'});
                }else if(userFind){
                    if(userFind._id == req.user.sub){
                        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar'});
                            }else if(userUpdated){
                                return res.send({message: 'Usuario actualizado', userUpdated});
                            }else{
                                return res.send({message: 'No se pudo actualizar al usuario'});
                            }
                        })
                    }else{
                        return res.send({message: 'Nombre de usuario ya en uso'});
                    }
                }else{
                    User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al actualizar'});
                        }else if(userUpdated){
                            return res.send({message: 'Usuario actualizado', userUpdated});
                        }else{
                            return res.send({message: 'No se pudo actualizar al usuario'});
                        }
                    })
                }
            })
        }else{
            User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al actualizar'});
                }else if(userUpdated){
                    return res.send({message: 'Usuario actualizado', userUpdated});
                }else{
                    return res.send({message: 'No se pudo actualizar al usuario'});
                }
            })
        }
    }
    
    
}



function saveUserAdmin(req, res){
    var user = new User();
    var params = req.body;

    if(params.name && params.username && params.email && params.password){
        User.findOne({username:params.username},(err,userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'})
            }else if(userFind){
                return res.send({message: 'Nombre de usuario no disponible'})
            }else{
                bcrypt.hash(params.password, null, null,(err,passwordHash)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al comparar contraseña'})
                    }else if(passwordHash){
                        user.password = passwordHash;
                        user.name = params.name;
                        user.lastname = params.lastname;
                        user.username = params.username;
                        user.email = params.email;
                        user.phone = params.phone;
                        user.role = params.role; //Opciones: 'ROLE_USER', 'ROLE_ADMINLEAGUE'

                        user.save((err, userSaved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al guardar usuario'});
                            }else if(userSaved){
                                return res.send({message: 'Usuario creado exitosamente', userSaved});
                            }else{
                                return res.status(500).send({message: 'No se guardó el usuario'});
                            }
                        })
                    }else{
                        return res.status(403).send({message: 'La contraseña no se ha encriptado'});
                    }
                })
            }
        })

    }else{
       return res.status(403).send({message: 'Ingresa todos los datos obligatorios'});     
    }
}

function removeUser(req,res){
    let id = req.params.id;

    User.findByIdAndRemove(id, (err, userRemoved)=>{
        if(err){
            return res.status(500).send({message:"error general"})
        }else if(userRemoved){
            League.remove({_id:userRemoved._id},(err, leagueRemoved)=>{
                if(err){
                    return res.status(500).send({message:"error general"})
                }else if(leagueRemoved){
                    return res.send({message:"se ha eliminado correctamente", leagueRemoved})
                }else{
                    return res.status(402).send({message:"No se ha encontrado ligas para eliminar"});        
                }
            })
        }else{
            return res.status(402).send({message:"No se ha encontrado el usuario"});
        }
    })

}

module.exports = {
    createInit,
    login,
    saveUser,
    updateUser,
    getUsers,
    updateUserAdmin,
    saveUserAdmin,
    removeUser
}