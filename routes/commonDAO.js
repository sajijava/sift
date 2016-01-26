var Promise = require('bluebird');
var _ = require('lodash');
var enums = require('./Enums');

var getAllSymbols = function(){
	
	return new Promise(function(resolve, reject){
		
						enums.dbCall()
						.then(function(db){
							var symbolList = db.collection(enums.tableName.WatcherData).distinct('data.symbol')
							resolve(symbolList);
						})
						.catch(function(err){
							reject(err);
							throw err;
						})
	})
	
}

exports.getAllSymbols = getAllSymbols;