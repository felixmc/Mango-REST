var config     = require("./config.json");
var restConfig = require("./sample-rest-config.json");

var log    = require("custom-logger").config({ level: 0 });

var express    = require("express");
var app        = express();
var bodyParser = require("body-parser");
app.use(bodyParser());

var mongoRest = require("./MongoRest");

console.dir(mongoRest);

app.use("/api", mongoRest(restConfig));

app.listen(config.service_port);
log.info("MongoRest Service started on port " + config.service_port);
