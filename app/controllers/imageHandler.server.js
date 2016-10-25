'use strict';

var Users = require('../models/users.js');
var Images = require('../models/images.js');

function ImageHandler() {

	this.getUserImages = function(req, res) {
		Images
			.find({
				'userId': req.params.id //req.user.github.id
			})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}
				res.send(result);
			});
	};
	this.getAllImages = function(req, res) {
		Images
		//  
			.find({})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}
				res.send(result);
			});
	};
	this.saveImage = function(req, res) {
			console.log("Save launched")
			console.log("tags:",req.body.tags)
				//console.log(req.body.pollName)	
			Images
				.findById(req.body._id, function(err, doc) {
					if (err) console.log(err);
					console.log("before save:", doc)
					doc.imageDesc = req.body.imageDesc;
					doc.linkUrl = req.body.linkUrl;
					doc.tags = req.body.tags;
					doc.likes = req.body.likes;
					doc.save();
					console.log("after save:", doc)
				})

		},
		this.createImage = function(req, res) {
			console.log("Create image launched")
			var newImage = new Images({
				imageDesc: req.body.imageDesc,
				linkUrl: req.body.linkUrl,
				tags: req.body.tags,
				likes: req.body.likes,
				userId: req.user.google.id,
				userName: req.user.google.name
			})
			newImage.save(function(err, doc, isSuccessful) {
				if (err) console.error(err);
				if (isSuccessful) res.send(JSON.stringify(doc)) //res.json("Success")
			});

		},
		this.deleteImage = function(req, res) {
			console.log("called deleteImage", req.params.imageID, req.user)
			Images
				.findById(req.params.imageID, function(err, doc) {
					if (err) console.error(err);
					console.log("found image for deletion:", doc);
					if (doc.userId == req.user.google.id) doc.remove()
					else console.log("trying to remove non-owned doc")
				});
		},
		this.getUserList = function(req, res) {
			Users
				.find({}, {
					"_id": 0,
					"google.token": 0,
					"google.email":0
				})
				.exec(function(err,result) {
					if (err) {
						throw err;
					}
					res.send(result);
				});
		}
}

module.exports = ImageHandler;
