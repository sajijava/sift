var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var enums = require('./Enums');
var _ = require('lodash');



var viewRawTemplate = function(req, res){
	var tableName = req.params.tablename;
	var field = req.params.field;
	var value = req.params.value;
	
	enums.dbCall()
		.then(function(db){
			
			var filter = {};
			if (!_.isUndefined(field) && !_.isUndefined(value)) {
					filter = {field:value};
			}
				return db.collection(tableName)
					.findAsync(filter);	
	
		})
		.then(function(cursor){ return cursor.toArrayAsync(); })
		.then(function(content){		res.json(content)		})
		.catch(function(err){			throw err;		});
		
}



exports.setRESTInterfaces = function(app){
	app.get('/api/get/db/:tablename/:field?/:value?', viewRawTemplate);
}