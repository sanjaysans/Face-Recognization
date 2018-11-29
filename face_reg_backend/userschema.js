var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var _ = require('lodash');


////////////////////////////////////////////////////////////////////////////// USERSCHEMA FOR RC  /////////////////////////////////////////////////////////////////////////

var Schema = mongoose.Schema,
	_id = Schema.ObjectID;

var userschema = new Schema({
    email: { type : String, required : true, minlength : 8, unique: true },
	password : { type : String, required : true },
	tokens : [{
		token : { 
			type : String, 
			required : true
		}
	}]
});

////////////////////////////////////////////////////////////////////////////// TOJSON FUNCTION ////////////////////////////////////////////////////////////////////////////

userschema.methods.toJSON = function() {
	var user = this;
	var userobj = user.toObject();
	return _.pick(userobj, ['_id', 'email']);
}

////////////////////////////////////////////////////////////////////////////// FIND BY TOKEN FUNCTION /////////////////////////////////////////////////////////////////////

userschema.statics.findbytoken = function(token, res){
	var user = this;
	try{
	var decode = jwt.verify(token, 'pass');
	}
	catch(e){
		return res.status(404).send("error");
	}
	user.findOne({_id: decode._id}).then((docs) => {
		docs.removetoken(token).then(()=>{
			return res.status(200).send("logout succesful");
		});
	}).catch(err => {
			return res.status(404).send("data not found");
	});
};

////////////////////////////////////////////////////////////////////////////// REMOVE TOKEN FUNCTION //////////////////////////////////////////////////////////////////////

userschema.methods.removetoken = function(token){
	var user = this;
	return user.update({
		$pull: {
			tokens: {token}
		}
	});
};

////////////////////////////////////////////////////////////////////////////// HASH AND SAVE FUNCTION /////////////////////////////////////////////////////////////////////

userschema.pre('save', function(next) {
	var user = this;
	if (!user.isModified('password')) return next();
    	bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
       	});
 	});
});

////////////////////////////////////////////////////////////////////////////// TOKEN GENERATION ///////////////////////////////////////////////////////////////////////////

userschema.methods.tokengen = function(){
	var user = this;
	var token = jwt.sign({ _id: user._id, email: user.email}, 'pass' ).toString();
	user.tokens = user.tokens.concat([{token}]);
	return user.save().then( () => {
		return token;
	});
};

var userrecord = mongoose.model('userrecord', userschema);
module.exports = { userrecord };
	

