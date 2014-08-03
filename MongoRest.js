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
								: new MongoRest.Model(name);
	
		var handler = fs.existsSync(handlerPath)
								?	require(handlerPath)(model)
								: MongoRest.Handler.crud(model);	
		
		var route = modelConfig.route || name;

		router.use("/" + route, handler);
	}

	return router;
};

MongoRest.Model   = require("./model").init(require("./config"));
MongoRest.Handler = require("./handler");

module.exports = MongoRest;
