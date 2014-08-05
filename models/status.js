module.exports = function(Model) {

	return {
		findByAuthor: function(author, success, error) {
			this.collection(function(db, col) {
				col.find({ 'author': author }).toArray(Model.response(success, error));
			});
		}
	}
};
