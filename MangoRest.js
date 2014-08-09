var express = require("express");
var fs      = require("fs");

function MangoRest(config) {
	var router = express.Router();

	var bodyParser = require("body-parser");
	router.use(bodyParser.json());

	for (var i = 0; i < config.length; i++) {
		var modelConfig = config[i];

		var name = modelConfig.name;

		var modelPath = "../../" + modelConfig.model;
		var handlerPath = "../../" + modelConfig.handler;

		var model   = modelConfig.model && fs.existsSync(modelPath)
							  ? new MangoRest.Model(name, require(modelPath))
								: new MangoRest.Model(name);
	
		var handler = modelConfig.handler && fs.existsSync(handlerPath)
								?	require(handlerPath)(MangoRest.Handler, model)
								: MangoRest.Handler.crud(model);	
		
		var route = modelConfig.route || name;

		router.use("/" + route, handler);
	}

	return router;
};

MangoRest.Handler = require("./handler");

exports.init = function(config) {
	MangoRest.Model = require("./model").init(config);
	return MangoRest;
};

exports.Server = function(obj) {
	var app = express();

	exports.init(obj.mongoConfig)
	app.use("/", MangoRest(obj.models));
		
	return app;
};
