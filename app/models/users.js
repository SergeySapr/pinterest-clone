'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	github: {
		id: {type: String, index: true},
		displayName: String,
		username: String,
        publicRepos: Number
	},
    pollsCount: Number
});

module.exports = mongoose.model('User', User);
