var express = require("express");
var fs      = require("fs");

function MongoRest(config) {
	var router = express.Router();

	var bodyParser = require("body-parser");
	router.use(bodyParser.json());

	for (var i = 0; i < config.length; i++) {
		var modelConfig = config[i];

		var name = modelConfig.name;

		var model   = modelConfig.model && fs.existsSync(modelConfig.model)
							  ? new MongoRest.Model(name, require(modelPath))
								: new MongoRest.Model(name);
	
		var handler = modelConfig.handler && fs.existsSync(modelConfig.handler)
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

exports.Server = function(obj) {
	var app = express();

	exports.init(obj.mongoConfig)
	app.use("/", MongoRest(obj.models));
		
	return app;
};
