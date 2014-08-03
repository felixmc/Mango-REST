var mongo  = require("mongodb");
var config = null;

exports.init = function(_config) {
	config = _config;
	exports = Model;
};

function Model(name) {
	var mongoHost = "mongodb://" + config.database_host + ":27017/" + config.database_name;

	this.name = name;

	// privileged method with access to mongoHost
	this.connect = function(callback) {
		mongo.MongoClient.connect(mongoHost, function(err, db) {
			if (err) { log.error(err); }
			else { callback(db); }
		});	
	};
}

Model.prototype.collection = function(collection, callback) {
	if (typeof collection == 'function' && typeof callback == undefined) {
		callback = collection;
		collection = this.name;	
	}

	mongo.MongoClient.connect(function(db) {
		 callback(db, db.collection(collection));
	});
};


Model.prototype.ID = function(id) {
	return new mongo.ObjectId(id);
};

// defined as a fallback; inheriting models should override this method
// ideally this should ensure a given object is valid and strip it of any invalid props
// it should also do any escaping and business logic validation
// error callback is used if the input cannot be parsed to the corresponding mongodb model
Model.prototype.parse = function(obj, success, error) {
	if (obj) success(obj);
	else error("Could not parse data to model");
};

Model.prototype.response = function(success, error) {
	return function(err, data) {
		if (err) error(err);
		else success(data);
	}
};

Model.prototype.getAll = function(success, error) {
	this.collection(function(db, col) {
		col.find({}).toArray(this.response(success, error));
	});
};

Model.prototype.create = function(data, success, error) {
	this.parse(data, function(obj) {
		this.collection(function(db, col) {
			col.insert(obj, { w: 1 }).toArray(this.response(success, error));
		});
	}, function(err) {
		error(err);
	});
};

Model.prototype.get = function(id, success, error) {
	this.collection(function(db, col) {
		col.find({ '_id': this.ID(id) }).toArray(this.response(success, error));
	});
};

Model.prototype.update = function(data, success, error) {
	this.parse(data, function(obj) {
		this.collection(function(db, col) {
			col.findAndModify({ '_id': data._id }, [['_id', 'asc']], data, {}).toArray(this.response(success, error));
		});
	}, function(err) {
		error(err);
	});
};

Model.prototype.delete = function(id, success, error) {
	this.collection(function(db, col) {
		col.remove({ '_id': this.ID(id)}).toArray(this.response(success, error));
	});
};
