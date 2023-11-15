'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    lastname: String,
    username: String,
    password: String,
    email: String,
    phone: String,
    image: String,
    role: String,
    leagues: [{type: Schema.ObjectId, ref: 'league'}]
})

module.exports = mongoose.model('user', userSchema);