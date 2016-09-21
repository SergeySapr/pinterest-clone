'use strict';

var Users = require('../models/users.js');
var Polls = require('../models/polls.js');

function PollHandler () {

	this.getPolls = function (req, res) {
		Polls
		// 'userId': req.user.github.id 
			.find({}, { '_id': false })
			.exec(function (err, result) {
				if (err) { throw err; }
				res.send(result);
			});
	};
}

module.exports = PollHandler;
