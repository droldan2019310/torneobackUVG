'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var teamSchema = Schema({
    name: String,
    logo: String,
    points: Number,
    PJ: Number,
    PG: Number,
    PE: Number,
    PP: Number,
    GF: Number,
    GC: Number,
    GD: Number,
    players: [{type: Schema.ObjectId, ref: 'player'}]
})

module.exports = mongoose.model('team', teamSchema);