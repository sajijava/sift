var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');


exports.datatype = {
	"Currency":"C",
	"Integer":"I",
	"Percent":"P",
	"Fraction":"F",
	"Text":"T",
	"Date":"D"
}


exports.align = {
		"Left":"L",
		"Right":"R",
		"Center":"C"
}

exports.datasource = {
	"Quote":"Q",
	"Fin":"F"
}

exports.dbCall = function(fn){
	
	mongoClient.connect('mongodb://localhost:27017/sift', function(err, db) {
		assert.equal(null, err);
		
		fn(db);		
		
		});
	
}
