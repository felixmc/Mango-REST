var express = require("express");
var fs      = require("fs");

function MongoRest(config) {
	var router = express.Router();

	for (var i = 0; i < config.length; i++) {
		var modelConfig = config[i];

		var name = modelConfig.model;

		var modelPath   = "./models/" + name + ".js";
		var handlerPath = "./handlers/" + name + ".js";

		var model   = fs.existsSync(modelPath)
							  ? new require(modelPath)(name)
								: new this.Model(name);
	
		var handler = fs.existsSync(handlerPath)
								?	require(handlerPath)(model)
								: this.Handler.crud(model);	
		
		var route = modelConfig.route || name;

		router.use("/" + route, handler);
	}
};

MongoRest.Model   = require("./model");
MongoRest.Handler = require("./handler");

exports = MongoRest;
