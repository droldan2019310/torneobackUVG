'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leagueSchema = Schema({
    name: String,
    season: String,
    logo: String,
    description: String,
    firstDate: Date,
    lastDate: Date,
    teams: [{type: Schema.ObjectId, ref: 'team'}],
    sessions: [{type: Schema.ObjectId, ref: 'session'}]
})

module.exports = mongoose.model('league', leagueSchema);