var express = require("express");

var Handler = {
	
	empty: function() {
		return express.Router();
	},

	crud: function(model, rt) {
		var router = rt || this.empty();

		router.get("/", this.getAll(model));
		router.post("/", this.create(model));
		router.get(this.id, this.getById(model));
		router.put(this.id, this.update(model));
		router.delete(this.id, this.delete(model));

		return router;
	},

	id: "/:id([0-9a-zA-Z]{24})",

	handleError: function(res) {
		return function(err) {
			console.log(err);
			res.send(500, { error: err });
		}
	},

	getAll: function(model) {
		return function(req, res)	{
			model.find({}, function(data) {
				res.json(data);		
			}, Handler.handleError(res));
		}
	},

	create: function(model) {
		return function(req, res) {
			model.create(req.body, function(data) {
				res.status(201).json(data);
			}, Handler.handleError(res));
		}
	},

	getById: function(model) {
		return function(req, res) {
			model.findById(req.params['id'], function(data) {
				if (data == null) res.send(404, { error: "Model was not found." });
				else res.json(data);
			}, Handler.handleError(res));	
		}
	},

	update: function(model) {
		return function(req, res) {
			model.update(req.body, function(data) {
				res.json(data);
			}, Handler.handleError(res));
		}
	},

	delete: function(model) {
		return function(req, res) {
			model.delete(req.params['id'], function(data) {
				res.status(204).end();
			}, Handler.handleError(res));
		}
	}

};

module.exports = Handler;
