var Promise = require('bluebird');
var mongoClient = Promise.promisifyAll(require('mongodb')).MongoClient;
var assert = require('assert');
var _ = require('lodash');


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
	"Fin":"F",
	"Input":"I"
}

exports.tableName = {
	"RawTemplate":"rawtemplate",
	"WatcherData":"watcherdata",
	"WatcherTemplate":"watchertemplate",
	"FinDataConsolidated":"findataconsolidated",
	"SampleQuoteData":"samplequotedata"	
}

exports.sampleSymbols = ["AAPL","YHOO","GOOG","NFLX"];

exports.dbconnectURL = 'mongodb://localhost:27017/sift'

var dbCall = function(){
	
	return mongoClient.connectAsync('mongodb://localhost:27017/sift');
	
}

exports.getData = function(tablename,  filters, projection){

	if (_.isUndefined(projection)) {
		projection = {"_id":0};
	}
	
	if (_.isUndefined(filters)) {
		filters = {};
	}

	console.log(tablename+'('+JSON.stringify(filters)+', '+JSON.stringify(projection)+')');

	return new Promise(function(resolve, reject){
										dbCall()
										.then(function(db){
											return db.collection(tablename)
															 .findAsync(filters,projection)
										})
										.then(function(cursor){ return cursor.toArrayAsync(); })
										.then(function(data){  resolve(data); })
										.catch(function(err){ throw err; })				
		})

}

exports.errorCode={
	
	"EmptyWatcherId":1001,
	"NoDataFound":1002,
	"success":0
}



exports.dbCall=dbCall