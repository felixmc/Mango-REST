module.exports = function(Handler, model) {
	var handler = Handler.empty();

	handler.get("/author/:name", function(req, res) {
		model.findByAuthor(req.params.name, function(data) {
			res.json(data);
		}, Handler.handleError(res));
	});

	handler = Handler.crud(model, handler);

	return handler;
};

