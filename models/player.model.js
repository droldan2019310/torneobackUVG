'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playerSchema = Schema({
    name: String,
    lastname: String,
    dorsal: String,
    position: String,
    goal: Number,
    cardR: Number,
    cardA: Number,
    cardT: Number
})

module.exports = mongoose.model('player', playerSchema);