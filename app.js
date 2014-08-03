var config     = require("./config.json");

var log = require("custom-logger").config({ level: 0 });

var express    = require("express");
var app        = express();
var bodyParser = require("body-parser");
app.use(bodyParser());

var mongoRest = require("./MongoRest");

app.use("/api", mongoRest([{ model: "status", route: "tweets" }]));

app.listen(config.service_port);
log.info("MongoRest Service started on port " + config.service_port);
