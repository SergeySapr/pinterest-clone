'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
       userId: String,
       pollName: String,
       pollQuestion: String,
       options: [{optionName: String,
               voteCount: Number }]
      }
);


module.exports = mongoose.model('Poll', Poll);
