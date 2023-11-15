'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var matchSchema = Schema({
    matchNumber: String,
    playersOne: [{type: Schema.ObjectId, ref: 'team'}],
    playersSecond: [{type: Schema.ObjectId, ref: 'team'}],
    goalsFirst: Number,
    goalsSecond:Number,
    foulOne: Number,
    foulSecond: Number,
    date: Date,
    leagues: [{type: Schema.ObjectId, ref: 'league'}]
})

module.exports = mongoose.model('match', matchSchema);