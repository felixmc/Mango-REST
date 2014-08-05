var mongo  = require("mongodb");
var config = null;

exports.init = function(_config) {
	config = _config;
	return Model;
};

function Model(name, ext) {
	var mongoHost = "mongodb://" + config.database_host + ":27017/" + config.database_name;

	if (typeof ext === 'function') {
		ext = ext(Model);
	}

	if (typeof ext === 'object') {
		for (var prop in ext) {
			if(ext.hasOwnProperty(prop)){
				this[prop] = ext[prop];
			}
		}
	}

	this.name = name;

	// privileged method with access to mongoHost
	this.connect = function(success, error) {
		mongo.MongoClient.connect(mongoHost, function(err, db) {
			if (err) {
				if (error) error(err);
				else throw err;
			}
			else { success(db); }
		});	
	};
}

Model.prototype.collection = function(collection, callback) {
	if (typeof collection == 'function' && typeof callback == 'undefined') {
		callback = collection;
		collection = this.name;	
	}
	
	this.connect(function(db) {
		callback(db, db.collection(collection));
	});
};

// 'static' method
Model.ObjectID = function(id) {
	return new mongo.ObjectID(id);
};

// defined as a fallback; inheriting models should override this method
// ideally this should ensure a given object is valid and strip it of any invalid props
// it should also do any escaping and business logic validation
// error callback is used if the input cannot be parsed to the corresponding mongodb model
Model.prototype.parse = function(obj, success, error) {
	if (obj) {
		if (typeof obj._id == 'string') obj._id = Model.ObjectID(obj._id);
		success(obj);
	 } else error("Could not parse data to model");
};

// 'static' method
Model.response = function(success, error) {
	return function(err, data) {
		if (err) error(err);
		else success(data);
	}
};

Model.prototype.find = function(options, success, error) {
	this.collection(function(db, col) {
		col.find(options).toArray(Model.response(success, error));
	});
};

Model.prototype.create = function(data, success, error) {
	var that = this;
	this.parse(data, function(obj) {
		that.collection(function(db, col) {
			col.insert(obj, Model.response(success, error));
		});
	}, function(err) {
		error(err);
	});
};

Model.prototype.findById = function(id, success, error) {
	this.collection(function(db, col) {
		col.findOne({ '_id': Model.ObjectID(id) }, Model.response(success, error));
	});
};

Model.prototype.update = function(data, success, error) {
	var that = this;
	this.parse(data, function(obj) {
		that.collection(function(db, col) {
			col.findAndModify({ '_id': Model.ObjectID(data._id) }, [['_id', 'asc']], data, {}, Model.response(success, error));
		});
	}, function(err) {
		error(err);
	});
};

Model.prototype.delete = function(id, success, error) {
	this.collection(function(db, col) {
		col.remove({ '_id': Model.ObjectID(id)}, Model.response(success, error));
	});
};
