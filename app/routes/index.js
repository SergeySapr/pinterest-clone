'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var PollHandler = require(path + '/app/controllers/pollHandler.server.js');
var Polls = require('../models/polls.js');
var bodyParser = require('body-parser');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
			//return next();
		}
	}

	var clickHandler = new ClickHandler();
	var pollHandler = new PollHandler();
	
	app.param('pollid', function(req, res, next, id) {
		var query = Polls.findById(id);
		query.exec(function (err, poll){
	    if (err) { return next(err); }
	    if (!poll) { return next(new Error('can\'t find poll')); }
	    req.poll = poll;
	    return next();
	});
	
	});
	app.get('/partials/:name', function (req, res) {
		  var name = req.params.name;
		  res.render('/public/partials/' + name);
		});


	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});
		


	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});
	app.route('api/polls/delete/:id')
		.delete(function(req,res){
			console.log("routing to pollHandler.delete")
			pollHandler.deletePoll(req,res);
		})
	app.route('/api/polls/new')
		.post(function(req,res){
			pollHandler.createPoll(req,res);
		});
	app.route('/api/polls')
		.get(pollHandler.getAllPolls)
		.post(function(req,res){
			pollHandler.savePoll(req,res);
		})
		.delete(function(req,res){
			pollHandler.deletePoll(req,res);
		})

	app.route('/api/currentuser')
		.get(function (req, res) {
			 if (req.isAuthenticated()) res.json(req.user)
			 else res.send("Not authenticated");
		});	
	app.route('/api/users/:id')
		.get(function (req, res) {
			res.send(req.params.ID);
		});

	app.route('/api/:id/polls')
		.get(isLoggedIn,function(req, res) {
			pollHandler.getUserPolls(req.params.ID);
		});
  	app.route('/api/vote')
		.post(function(req, res) {
			console.log("launching poll handler");
			pollHandler.vote(req, res);
		});
	app.route('/auth/github')
		.get(passport.authenticate('github'));
	app.route('/auth/google')
		.get(passport.authenticate('google',{ scope : ['profile', 'email'] }));
	// app.route('/auth/github/callback')
	// 	// .get(passport.authenticate('github', {
	// 	// 	successRedirect: '/',
	// 	// 	failureRedirect: '/login'
	// 	// }));
		app.route('/auth/google/callback')
            .get(passport.authenticate('google', {
                    successRedirect : '/',
                    failureRedirect : '/'
            }));
	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
		
	app.route('/api/polls/:pollid')
		.get(function (req, res) {
			res.json(req.poll);
		})
		.delete(isLoggedIn,function(req,res){
			pollHandler.deletePoll(req,res)
		});
		
	app.route('/*')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});
};
