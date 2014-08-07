# MangoRest
MangoRest is a minimal library for mapping monogodb collections to a REST service.


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

var mangoRest = require("mango-rest").Server(config);

mangoRest.listen(3000);
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
var mangoRest = require("mango-rest").init(mongoConfig);

app.use("/", mangoRest(models));

app.listen(3000);
```

Both of the above code samples provide the same REST functionality:

`GET` to `/comments` and `/posts` to return all objects of that type  
`POST` to `/comments` and `/posts` to create a new object of that type  
`GET` to `/comments/:id` and `/posts:id` where `:id` is a MongoDB id string to return an object  
`PUT` to `/comments/:id` and `/posts:id` where `:id` is a MongoDB id string to update an object  
`DELETE` to `/comments/:id` and `/posts:id` where `:id` is a MongoDB id string to delete an object  


## Config

### MongoDB Connection Config
MongoDB can be configured two ways: as an object with a `host` and `database` property and optional `username` and `password` properties:
```json
{
  host: "localhost",
  database: "mydb",
  username: "admin",
  password: "pass"
}
```

Or as a MongoDB connection string: `mongodb://admin:pass@localhost:27017/mydb`

### Collection Config
MangoRest takes in MongoDB collections to REST-ify as an array of objects. The objects have the following properties:

- **name** _(required)_: The name of the collection to be mapped to a REST service
- **route** _(optional)_: The route to map the collection to. The default value is the collection's name
- **model** _(optional)_: File path to model that adds functionality for retrieving or modifying collection objects. Used by handler to perform data operations. Default model provides basic CRUD functionality
- **handler** _(optional)_: File path to handler to extend or overwrite default handler. A handler handles HTTP requests to retrieve or modify collection objects. The default handler handles routes for basic CRUD

## API
While MangoRest provides CRUD REST functionality for MongoDB collections by default, this can be easily overwritten or expanded upon.

### Model
Here is how to extend the default Model (models can only be extended and not overwritten):

```javascript
module.exports = function(Model) {

	return {
		findByAuthor: function(author, success, error) {
			this.collection(function(db, col) {
				col.find({ 'author': author }).toArray(Model.response(success, error));
			});
		}
	}
};
```

Extending a Model requires defining a function that takes in the Model object and retuns an object of functions or properties that are to be added to the model for a particular collection. The above example illustrates how to add a "findByAuthor" method for the Model associated with a collection of post objects. This new method is accessible from the model passed to the handler.

Below is the public interface of the Model object:  
- **.collection(callback)**: loads the default collection associated with the model from the database
  - *callback* Function(database, collection): takes in references to the database and to the collection

- - -

- **.collection(collection, callback)**: loads a specified collection from the database
  - *collection* String: name of collection to load
  - *callback* Function(database, collection): takes in references to the database and to the collection

- - -

- **.ObjectID(id)**: parses a hexdecimal string and returns a MongoDB ObjectID
  - *id* String: id string for a MongoDB object

- - -

- **.response(success, error)**: takes in success and error callbacks for a MongoDB operation and retuns a single MongoDB callback that calls the success or error callbacks depending on the success of the MongoDB operation
  - *success* Function(obj): callback called if MongoDB operation is successful. takes in result object
  - *error* Function(err): callback called when MongoDB operation failed. takes in error message string 

- - -

- **.parse(obj, success, error)**: this function is defined as a fallback. it is recommended that inheriting models overwrite this method. Ideally, this method should ensure a give object is valid and strip it of any invalid properties, as well as doing any escaping and business logic validation. Error callback should be called if the object cannot be parsed to a valid model. It is used by the default create and update methods of the model. The default function returns success if the object is not null/undefined
  - *obj* Object: any JS object to be parsed
  - *success* Function(obj): callback called if parse is successful. takes in a result object
  - *error* Function(err): callback called when parsing failed. takes in error message string 
  
- - -

- **.find(options, success, error)**: finds all MongoDB documents from the default collection of this model according to the options passed in
  - *options* Object: used to filter objects in the current collection. same functionality as the options object in MongoDB's collection.find()
  - *success* Function(obj): callback called if MongoDB operation is successful. takes in the find results
  - *error* Function(err): callback called when MongoDB operation failed. takes in error message string 

- - -

- **.findById(id, success, error)**: finds a single MongoDB document matching the given id
  - *id* ObjectID or string: used to find specific document
  - *success* Function(obj): callback called if MongoDB operation is successful. takes in the found object or null
  - *error* Function(err): callback called when MongoDB operation failed. takes in error message string 

- - -

- **.create(object, success, error)**: creates a new object in the collection associated with the model
  - *options* Object: object to be added
  - *success* Function(obj): callback called if MongoDB operation is successful. takes in the newly create object
  - *error* Function(err): callback called when MongoDB operation failed. takes in error message string 

- - -

- **.update(object, success, error)**: update an object in the collection associated with the model
  - *options* Object: object to be updated. must contain an _id property
  - *success* Function(obj): callback called if MongoDB operation is successful. takes in the updated object
  - *error* Function(err): callback called when MongoDB operation failed. takes in error message string 

- - -

- **.delete(id, success, error)**: delete an object from the collection associated with the model
  - *options* ObjectID or string: id of object to be deleted
  - *success* Function(): callback called if MongoDB operation is successful
  - *error* Function(err): callback called when MongoDB operation failed. takes in error message string 

### Handler
This is how to create or extend a handler:

```javascript
module.exports = function(Handler, model) {
	// new router with no routes
	var router = Handler.empty();

	// handle a new path
	router.get("/author/:name", function(req, res) {
		model.findByAuthor(req.params.name, function(data) {
			res.json(data);
		}, Handler.handleError(res));
	});

	// add basic CRUD handling to the handler
	Handler.crud(model, router);

	return router;
};
```

A handler is essentially an abstraction of an express.js router.

Creating a new handler requires defining a function that takes in the Handler object and a model associated with a collection and retuns an express.js router. `Handler.empty()` returns an empty router (used to overwrite the default router) while `Handler.crud()` attaches CRUD methods for the given model to a router (used to extend the default handler).

Below is the public interface of the Handler object:  
- **.empty()**: returns an empty express.js router. used when overwriting the default handler

- - -

- **.crud(model)**: returns an express.js router that handles CRUD operation for the given model
  - *model* Model: model associated with a MongoDB collection

- - -

- **.crud(model, router)**: adds functionality to an express.js router that handles CRUD operation for the given model
  - *model* Model: model associated with a MongoDB collection
  - *router* express.js router: an express.js router to add the CRUD functionality to

- - -

- **.handleError(res)**: returns an error callback that returns 500 status code
  - *res* express.js response: response object to use to return the error

- - -

- **.id()**: returns a string representing the URL pattern for a MongoDB id

- - -

- **.handleError(res)**: returns an error callback that returns 500 status code
  - *res* express.js response: response object to use to return the error

- - -

- **.getAll(model)**: returns an express.js router callback that handles getAll CRUD functionality for the given model
  - *model* Model: model associated with a MongoDB collection

- - -

- **.getById(model)**: returns an express.js router callback that handles getById CRUD functionality for the given model
  - *model* Model: model associated with a MongoDB collection

- - -

- **.create(model)**: returns an express.js router callback that handles create CRUD functionality for the given model
  - *model* Model: model associated with a MongoDB collection

- - -

- **.update(model)**: returns an express.js router callback that handles update CRUD functionality for the given model
  - *model* Model: model associated with a MongoDB collection

- - -

- **.delete(model)**: returns an express.js router callback that handles delete CRUD functionality for the given model
  - *model* Model: model associated with a MongoDB collection
