'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Image = new Schema({
       userId: String,
       userName: String,
       imageDesc: String,
       linkUrl: String,
       tags: [{text:String}],
       likes: Number
      }
);


module.exports = mongoose.model('Image', Image);
