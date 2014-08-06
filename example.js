var restServer = require("./MongoRest").Server({ mongoConfig: { host: "localhost", database: "example" }, models: [{ model: "myModel", route: "myRoute" }] });

restServer.listen(3322);
