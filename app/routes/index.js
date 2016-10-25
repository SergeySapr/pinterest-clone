'use strict';

var path = process.cwd();
var ImageHandler = require(path + '/app/controllers/imageHandler.server.js');
var Images = require('../models/images.js');
var bodyParser = require('body-parser');

module.exports = function(app, passport) {

	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		else {
			res.redirect('/login');
			//return next();
		}
	}

	var imageHandler = new ImageHandler();

	app.param('imageID', function(req, res, next, id) {
		var query = Images.findById(id);
		query.exec(function(err, image) {
			if (err) {
				return next(err);
			}
			if (!image) {
				return next(new Error('can\'t find image'));
			}
			req.image = image;
			return next();
		});

	});
	app.get('/partials/:name', function(req, res) {
		var name = req.params.name;
		res.render('/public/partials/' + name);
	});

	app.route('/login')
		.get(function(req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function(req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/profile')
		.get(isLoggedIn, function(req, res) {
			res.sendFile(path + '/public/profile.html');
		});
	app.route('api/images/delete/:id')
		.delete(function(req, res) {
			console.log("routing to imageHandler.delete")
			imageHandler.deleteImage(req, res);
		})
	app.route('/api/images/new')
		.post(function(req, res) {
			imageHandler.createImage(req, res);
		});
	app.route('/api/images')
		.get(imageHandler.getAllImages)
		.post(function(req, res) {
			imageHandler.saveImage(req, res);
		})
		.delete(function(req, res) {
			imageHandler.deleteImage(req, res);
		})

	app.route('/api/currentuser')
		.get(function(req, res) {
			if (req.isAuthenticated()) res.json(req.user)
			else res.send("Not authenticated");
		});
	app.route('/api/users/:id')
		.get(function(req, res) {
			res.send(req.params.ID);
		});
	app.route('/api/users')
		.get(function(req, res) {
			imageHandler.getUserList(req, res);
		});
	app.route('/api/:id/images')
		.get(function(req, res) {
			console.log("routing '/api/:id/images' to imagehandler", req.params.id)
			imageHandler.getUserImages(req, res);
		});
	app.route('/auth/github')
		.get(passport.authenticate('github'));
	app.route('/auth/google')
		.get(passport.authenticate('google', {
			scope: ['profile', 'email']
		}));
	// app.route('/auth/github/callback')
	// 	// .get(passport.authenticate('github', {
	// 	// 	successRedirect: '/',
	// 	// 	failureRedirect: '/login'
	// 	// }));
	app.route('/auth/google/callback')
		.get(passport.authenticate('google', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
	app.route('/api/images/:imageID')
		.get(function(req, res) {
			res.json(req.image);
		})
		.delete(isLoggedIn, function(req, res) {
			imageHandler.deleteImage(req, res)
		});

	app.route('/*')
		.get(function(req, res) {
			res.sendFile(path + '/public/index.html');
		});
};
