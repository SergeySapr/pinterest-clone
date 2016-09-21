'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
       id: {type: String, index: true},
       userId: String,
       pollName: String,
       options: [
           {
               optionName: String,
               voteCount: Number
           }
           ]
      }
);

module.exports = mongoose.model('Poll', Poll);
