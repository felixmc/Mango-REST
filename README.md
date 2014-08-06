# MongoRest
MongoRest is a minimal library for mapping monogodb collections to a REST service.

Sample usage:
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

It can also be integrated with express.js as a middleware, which affords more customization:

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

Both of the above code samples provide essentially the same REST functionality:

`GET` to `/comments` and `/posts` to return all objects of that type  
`POST` to `/comments` and `/posts` to create a new object of that type  
`GET` to `/comments/:id` and `/posts:id` where `:id` is a MongoDB id string to return individual objects  
`PUT` to `/comments/:id` and `/posts:id` where `:id` is a MongoDB id string to update individual objects  
`DELETE` to `/comments/:id` and `/posts:id` where `:id` is a MongoDB id string to delete individual objects  


