var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var enums = require('./Enums');
var _ = require('lodash');



var viewRawTemplate = function(req, res){
	var tableName = req.params.tablename;
	var field = req.params.field;
	var value = req.params.value;
	
	enums.dbCall(function(db){
		
			
		
		if (!_.isUndefined(tableName) && !_.isUndefined(field) && !_.isUndefined(value)) {
			db.collection(tableName)
			.find({field:value}).toArray(function(arr,result){
					res.json(result);	
		 })
		}else if (!_.isUndefined(tableName)){
			console.log('only table name available')
			db.collection(tableName).find().toArray(function(arr,result){
					res.json(result);	
		 })
			
		}
		
	});
}



exports.setRESTInterfaces = function(app){
	app.get('/api/get/db/:tablename/:field?/:value?', viewRawTemplate);
}