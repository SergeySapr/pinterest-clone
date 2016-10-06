'use strict';

var Users = require('../models/users.js');
var Polls = require('../models/polls.js');

function PollHandler() {

	this.getUserPolls = function(req, res) {
		Polls
		//  
			.find({
				'userId': req.user.google.id//req.user.github.id
			}, {
				'_id': false
			})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}
				res.send(result);
			});
	};
	this.getAllPolls = function(req, res) {
		Polls
		//  
			.find({})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}
				res.send(result);
			});
	};
	this.getPoll = function(req, res) {
		Polls
		//  
			.find({
				'userId': req.user.google.id //req.user.github.id
			}, {
				'_id': false
			})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}
				res.send(result);
			});

	};
	this.savePoll = function(req, res) {
			console.log("Save launched")
				//console.log(req.body.pollName)	
			Polls
				.findById(req.body._id, function(err, doc) {
					if (err) console.log(err);
					console.log(doc)
					doc.pollName = req.body.pollName;
					doc.pollQuestion = req.body.pollQuestion;
					doc.options = req.body.options;
					doc.save();
				})

		},
	this.createPoll = function(req, res) {
		console.log("Create poll launched")
			var newPoll = new Polls({
				pollName: req.body.pollName,
				pollQuestion: req.body.pollQuestion,
				options: req.body.options,
				userId: req.body.userId
			})
			newPoll.save(function(err,doc,isSuccessful){
				if (isSuccessful) res.send(JSON.stringify(doc))//res.json("Success")
			});
			
		},
	this.deletePoll = function(req, res) {
		console.log("called deletePoll",req.params.pollid,req.user)
			Polls
				.findById(req.params.pollid, function(err, doc) {
					if (err) console.error(err);
					console.log(doc);
					if (doc.userId == req.user.google.id) doc.remove()
					else console.log("trying to remove non-owned doc")
				});
		},
		
	this.vote = function(req, res) {
			//console.log("Processing vote query ", req.query)
			

			Polls
				.findById(req.query.pollid, function(err, doc) {
					if (err) console.error(err);
					console.log("submitted to pollhandler the query ", req.query);
					
					if (!req.query.isNewOption) //if voting for existing option, find it and increment its votecount by 1
						for (var i = 0; i < doc.options.length; i++) {
						if (doc.options[i]._id == req.query.optionid) {
							console.log("found option!!!");
							doc.options[i].voteCount++
						}
					} else { //if new option - add this option with votecount 1
						doc.options.push({"optionName": req.query.optionText,"voteCount":1});
					}
					doc.save();
					res.json(doc);
				})
		
			
			Polls
			//this simpler option doesn't work for some reason 
			//	.findOneAndUpdate({ "_id": query.pollid, "options.id":query.optionsid}, { $inc: { "voteCount" : 1 } })
		}

}

module.exports = PollHandler;
