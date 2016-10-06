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
		google: {
		id: {type: String, index: true},
		token: String,
		name: String,
		email: String
	},
    pollsCount: Number
});

module.exports = mongoose.model('User', User);
