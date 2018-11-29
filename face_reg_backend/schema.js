var mongoose = require('mongoose');

var Schema = mongoose.Schema,
	_id = Schema.ObjectID;
////////////////////////////////////////////////////////////////////////////// RECORDSCHEMA FOR ATTENDANCE  ///////////////////////////////////////////////////////////////

var recordschema = new Schema({
		roll: { type: Number, require: true},
		day: { type : Number, require: true},
		month: { type : Number, require: true},
		year: { type :Number, require: true},
		hour: { type : Number, require: true},
		minute: { type : Number, require: true}
});

recordschema.methods.tosave = function(res) {
	var user = this;
	user.save().then(doc => {
		return res.status(200).send("updated successfully");
	}).catch(err => {
		return res.status(404).send("not a valid data");
	});
};


var record = mongoose.model('record', recordschema);
module.exports = {record};
