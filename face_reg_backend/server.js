var mongoose = require('mongoose');
var {url} = require('./database');
var {record} = require('./schema');
var {studentrecord} = require('./studentschema');
var validator = require("email-validator");
var currentTime = new Date();
var {userrecord} = require('./userschema');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var express = require('express');
var jwt = require('jsonwebtoken');
var Cryptr = require('cryptr'),
    cryptr = new Cryptr('sanjaykumar');
var promise = require('promise');

var app = express();
app.use(bodyParser.json());
mongoose.Promise = Promise;

mongoose.connect(url, function(err){
	if(err) throw err;
	console.log('successfully connected');
	});

////////////////////////////////////////////////////////////////////////////// FOR RECORD SCHEMA ////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////// TO STORE ATTENDANCE RECORD ///////////////////////////////////////////////////////////////

app.post("/postdata", (req, res) => {
	var data = new record(req.body);
	data.tosave(res);
});

////////////////////////////////////////////////////////////////////////////// TO DISPLAY ALL RECORD /////////////////////////////////////////////////////////////////////

app.get("/getdata",(req,res) => {
	var token = req.header('x-auth');
	token = decrypt(token);
	try{
	var decode = jwt.verify(token, 'pass');
	}
	catch(e){
		return res.status(404).send("error");
	}
	userrecord.findOne({_id: decode._id}).then((docs1) => {
		record.find({}).sort({roll:1}).then(docs => {
			if(!docs){
				res.status(404).send("document not available");
			}
			res.send(docs);
		});
	}).catch(err => {
			res.send(404).send("not a valid token");
	});
});

////////////////////////////////////////////////////////////////////////////// TO DISPLAY A PARTICULAR RECORD BY ROLL ////////////////////////////////////////////////////

app.get("/getdatabyroll/:num", (req, res) => {
	var n = req.params.num;
	var token = req.header('x-auth');
	token = decrypt(token);
	try{
	var decode = jwt.verify(token, 'pass');
	}
	catch(e){
		return res.status(404).send("error");
	}
	userrecord.findOne({_id: decode._id}).then((docs1) => {
		record.find({roll: n}).then(docs => {
			if(!docs){
				res.status(404).send("not found");
				}
			res.send(docs);
		}).catch(err => {
				res.status(404).send("no record found")
		});
	}).catch(err => {
			res.send(404).send("not a valid token");
	});
});

////////////////////////////////////////////////////////////////////////////// TO DISPLAY A PARTICULAR RECORD BY DATE ////////////////////////////////////////////////////

app.get("/getdatabydate/:date/:mon/:yr", (req, res) => {
	var date = req.params.date;
	var mon = req.params.mon;
	var yr = req.params.yr;
	var token = req.header('x-auth');
	token = decrypt(token);
	try{
	var decode = jwt.verify(token, 'pass');
	}
	catch(e){
		return res.status(404).send("error");
	}
	userrecord.findOne({_id: decode._id}).then((docs1) => {
		record.find({day: date, month: mon, year: yr}).then(docs => {
			if(!docs){
				res.status(404).send("not found");
				}
			res.send(docs);
		}).catch(err => {
				res.status(404).send("no record found")
		});
	}).catch(err => {
			res.send(404).send("not a valid token");
	});
});

//////////////////////////////////////////////////////////////////////////// STUDENTRECORD  SCHEMA ////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////// TO STORE STUDENT DATA  /////////////////////////////////////////////////////////////////

app.post("/stdupload", (req,res) => {
	var roll = req.body.roll;
	var email = req.body.email;
	var name = req.body.name;
	var year = currentTime.getFullYear();
	var rollyr = parseInt(roll / 1000000);
	if(roll.toString().length == 10){
		if(rollyr <= year && rollyr >= (year-5)){
			if(name != null){
				if(validator.validate(req.body.email)){
					var data = new studentrecord(req.body);
					data.tosave(res);
				}
				else{
					res.status(404).send("enter a valid email");
				}
			}
			else{
				res.status(404).send("enter a valid name");

			}
		}
			else{
				res.status(404).send("enter valid roll number");
			}
	}
		else{
			res.status(404).send("enter valid roll number");
		}
});

////////////////////////////////////////////////////////////////////////////// TO DISPLAY STUDENT RECORD ///////////////////////////////////////////////////////////////

app.get("/stdget",(req,res) => {
	studentrecord.find({}).sort({roll:1}).then(docs => {
		if(!docs){
			return res.status(400).send();
			}
		res.send(docs);
	});
});

////////////////////////////////////////////////////////////////////////////// USERRECORD SCHEMA /////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////// TO REGISTER RC DETAILS ////////////////////////////////////////////////////////////////////

app.post("/register",(req,res) => {
	var data = new userrecord(req.body);	
	if(validator.validate(data.email)){
		if(data.password.toString().length >= 8){
			data.tokengen().then((token)=>{
					return res.send({token});
					});
               	}
		else{
			return res.status(404).send("Enter a password with min 8 chars");
		}
	}
	else{
		return res.status(404).send("Enter a valid email");
	}
});

////////////////////////////////////////////////////////////////////////////// TO LOGIN INTO RC ACCOUNT //////////////////////////////////////////////////////////////////

app.post("/login",(req,res) => {
	userrecord.findOne({email: req.body.email}).then(docs => {
		if(!docs) {
			return res.status(404).send("record not found");
 		}		
 		bcrypt.compare(req.body.password, docs.password).then(result => {
 			if (result){
				docs.tokengen().then((token)=>{
					token = encrypt(token);
					res.header('x-auth', token).send(docs);
				});
			}
			else {
	    		return res.status(404).send("invalid password");
	  		}
 		}).catch(err => {
 			return res.status(404).send("error");
 		});
	}).catch(err => {
		return res.status(404).send("record not found");
	});
});

////////////////////////////////////////////////////////////////////////////// TO DISPLAY ALL RC ACCOUNT /////////////////////////////////////////////////////////////////

app.get("/userget",(req,res) => {
	userrecord.find({}).then(docs => {
		if(!docs){
			return res.status(400).send();
			}
		res.send(docs);
	});
});

////////////////////////////////////////////////////////////////////////////// TO LOGOUT AND DELETE TOKEN ////////////////////////////////////////////////////////////////

app.delete("/logout", (req, res) => {
	var token = req.header('x-auth');
	token = decrypt(token);
	var result = userrecord.findbytoken(token, res);
});

///////////////////////////////////////////////////////////////////////////// ENCRYPT AND DECRYPT FUNCTION ///////////////////////////////////////////////////////////////

function encrypt(text){
	var encryptedString = cryptr.encrypt(text);
	return encryptedString;
}
 
function decrypt(text){
	var decryptedString = cryptr.decrypt(text);
	return decryptedString;
}

app.listen(3000);
