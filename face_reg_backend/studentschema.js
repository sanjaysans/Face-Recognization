var mongoose = require('mongoose');

 var Schema = mongoose.Schema;
	_id = Schema.ObjectID;

////////////////////////////////////////////////////////////////////////////// STUDENTSCHEMA FOR STUDENT RECORD ///////////////////////////////////////////////////////////

var studentschema = new Schema({
	 	roll:{ type : Number, unique : true, require: true},
    	name:{ type: String, require: true},
        email:{ type: String, require: true}
});


studentschema.methods.tosave = function(res) {
	var user = this;
	user.save().then(doc => {
		return res.status(200).send("updated successfully");
	}).catch(err => {
		return res.status(404).send("not a valid data");
	});
};


var studentrecord = mongoose.model('studentrecord', studentschema);
module.exports = {studentrecord};