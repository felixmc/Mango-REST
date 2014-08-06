# MongoRest
MongoRest is a minimal library for mapping monogodb collections to a REST service.


## Example

Creating a REST service that serves standard CRUD for two MongoDB collections:

```javascript
var config = {
  mongoConfig: {
    host: "localhost",
    database: "exampleDB"
  },
  models: [
    { name: "userPosts", route: "posts" }
    { name: "comments" }, // route inferred from name
  ]
};

var mongoRest = require("MongoRest").Server(config);

mongoRest.listen(3000);
```

Same as above, but as express.js middleware, which can afford more customization:

```javascript
var mongoConfig = {
  host: "localhost",
  database: "exampleDB"
};

var models = [
  { name: "userPosts", route: "posts" }
  { name: "comments" }, // route inferred from name
];

var app = require("express")();
var mongoRest = require("MongoRest").init(mongoConfig);

app.use("/", mongoRest(models));

app.listen(3000);
```

Both of the above code samples provide the same REST functionality:

`GET` to `/comments` and `/posts` to return all objects of that type  
`POST` to `/comments` and `/posts` to create a new object of that type  
`GET` to `/comments/:id` and `/posts:id` where `:id` is a MongoDB id string to return an object  
`PUT` to `/comments/:id` and `/posts:id` where `:id` is a MongoDB id string to update an object  
`DELETE` to `/comments/:id` and `/posts:id` where `:id` is a MongoDB id string to delete an object  


## MongoDB Config
MongoDB can be configured two ways: as an object with a `host` and `database` property and optional `username` and `password` properties:
