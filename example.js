var restServer = require("./MangoRest").Server({ mongoConfig: { host: "localhost", database: "example" }, models: [{ name: "myModel", route: "myRoute" }] });

restServer.listen(3322);
