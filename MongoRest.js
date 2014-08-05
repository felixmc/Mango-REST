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
							  ? new MongoRest.Model(name, require(modelPath))
								: new MongoRest.Model(name);
	
		var handler = fs.existsSync(handlerPath)
								?	require(handlerPath)(MongoRest.Handler, model)
								: MongoRest.Handler.crud(model);	
		
		var route = modelConfig.route || name;

		router.use("/" + route, handler);
	}

	return router;
};

MongoRest.Handler = require("./handler");

exports.init = function(config) {
	MongoRest.Model = require("./model").init(config);
	return MongoRest;
};
