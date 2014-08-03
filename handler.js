var express = require("express");

exports = {
	
	empty: function() {
		return express.Router();
	},

	crud: function(model) {
		var router = this.empty();

		router.get("/", this.getAll(model));
		router.post("/", this.create(model));
		router.get("/:id", this.get(model));
		router.put("/:id", this.update(model));
		router.delete("/:id", this.delete(model));

		return router;
	},

	handleError: function(res) {
		return function() {
			res.send(500);
		}
	},

	getAll: function(model) {
		return function(req, res)	{
			model.findAll(function(data) {
				res.json(data);		
			}, this.handleError(res));
		}
	},

	create: function(model) {
		return function(req, res) {
			model.create(req.body, function(data) {
				res.send(201);
			}, this.handleError(res));
		}
	},

	getById: function(model) {
		return function(req, res) {
			model.getById(req.params['id'], function(data) {
				res.json(data);
			}, this.handleErrors(res));	
		}
	},

	update: function(model) {
		return function(req, res) {
			model.update(req.body, function(data) {
				res.json(data);
			}, this.handleErrors(res));
		}
	},

	delete: function(model) {
		return function(req, res) {
			model.delete(req.params['id'], function(data) {
				res.send(204);
			}, this.handleErrors(res));
		}
	}

};
