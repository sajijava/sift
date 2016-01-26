var Promise = require('bluebird');
var common = require('./common');
var fieldSrc = require('./fieldSource');
var _ = require('lodash');
var assert = require('assert');
var enums = require('./Enums');

var watcherTemplatesFileName= 'WatcherTemplates.json';

var watcherDataFileName = "WatcherData.json";

var watcher = {};

var templateStruct = {};

var watcherData = [];

var loadData = function(){
	watcherData = common.readAll(watcherDataFileName);
	//console.log(watcherData)
	watcherData.forEach(function(d){
	//	persistWatcherData (d,{'id':'saji'});
	})
}

var persistWatcherData = function(watcherData, user){
	enums.dbCall()
	.then(function(db){
		
		if(_.isUndefined(watcherData['userId'])){
			watcherData['userId'] = user.id;
		}
		
		db.collection(enums.tableName.WatcherData)
		.insertOneAsync(watcherData);
		
		return db;
	})
	.then(function(db){  db.close(); } )
	.catch(function(err){ throw err; })
	
}

var persistTemplate = function(template){
	
	console.log(template);
	
	enums.dbCall()
	.then(function(db){
			db.collection(enums.tableName.RawTemplate)
				.insertOneAsync(template);
			
			return db;
	})
	.then(function(db){
			var watchertemp = buildWatcherTemplates(template);
			
			db.collection(enums.tableName.WatcherTemplate)
					.insertOne(watchertemp);
					
			return db;		
	})
	.then(function(db){
			db.close();
		})
	.catch(function(err){
		throw err;
	})
}

var buildWatcherTemplates = function(rawTemplate){
	var watcher = {};

	var metaData = buildMetaData(rawTemplate.table);
		
	watcher = {
							"templateId":rawTemplate.templateId,
							"name":rawTemplate.name,
							"template":rawTemplate.table,
							"formatting":rawTemplate.formatting,
							"header":metaData.header,// only the header
							"sourceFlds":metaData.sourceFlds // find all source fields
						};
	return watcher;
}


var buildMetaData  = function(table){
	var header = [];
	var sourceFlds={};
	var inputFlds={};
	var rowStruct = {};
	
	for(key in table){
		var row = table[key];
		// identify all the input fields.
		if (row.source == 'I') {
			inputFlds[row.name] = {};
		}
	}
	
	for(key in table){
		var row = table[key];


		var cellFilter = "";//getCellFilter(row.type);
		//console.log(cellFilter);
		// column headers
		header.push({"name":row.header,"field":row.name,"cellFilter":cellFilter,"width":(row.size * 15)});
	
	
		//parse source field
		if (_.isUndefined(inputFlds[row.name])) {
		
			if (_.isUndefined(row.formula)) {
				sourceFlds[row.name] = getFieldAttributes(row.name);
			}else{
				sourceFlds[row.name] = getFieldAttributes(row.name);
				parseFormula(row.formula,sourceFlds,inputFlds);
			}
		}
		
	
	}
	return {"header":header,"sourceFlds":sourceFlds};
}


var getFieldAttributes = function(fieldName){
	 return _.isUndefined(fieldSrc[fieldName])?{}:fieldSrc[fieldName];
}

// parse formula and add the fields to sourceFld or inputFld list
var parseFormula = function(formula, sourceFlds,inputFlds){

	for(field in fieldSrc)
	{
		if(formula.indexOf(field) > -1)
		{
			if(_.isUndefined(sourceFlds[field]) && _.isUndefined(inputFlds[field]))
			{
				sourceFlds[field] = getFieldAttributes(field);
			}
		}
	}
	return formula;
}

var getCurrentTemplate = function(templateId){
	return enums.getData(enums.tableName.WatcherTemplate,{"templateId":templateId});
}

var getAllTemplateName = function(callbackFn){
	//loadData();
	return enums.getData(enums.tableName.WatcherTemplate,{},{"templateId":1,"name":1,"_id":0});

}

var getSymbols = function(templateId){
	
	return new Promise(function(resolve, reject){
				enums.getData(enums.tableName.WatcherData,{'id':templateId},{"data.symbol":1,"_id":0})
				.then(function(d){
						var symbolList = [];
						
						if (!_.isEmpty(d)) {
							d[0].data.forEach(function(d){	symbolList.push(d.symbol)});
							//console.log(symbolList);
							resolve(symbolList);
						}else{
							reject();
						}
				})
				.catch(function(err){
					reject(err);
					throw err;
				})
	})
	
}
/*var getMaxTemplateId = function(){
	loadTemplates();
	
	var maxId = 0;
	for (temp in watcher){
		var tempId = +temp
			if (tempId > maxId) {
				maxId = tempId;
			}
	}
	return maxId;
	
}*/
// saved data for the template
var getCurrentTemplateData = function(templateId){
	
	return enums.getData(enums.tableName.WatcherData,{'id':templateId})
	.then(function(d){
		return d[0];
	})

}


var updateWatcherData = function(id, updatedData){
	//loadData();
	return new Promise(function(resolve, reject){
										enums.dbCall()
										.then(function(db){
												db.collection(enums.tableName.WatcherData)
												.updateOne({'id':id},{$set:{'data':updatedData}})
												return db;	
										})
										.then(function(db){
												db.close();
												resolve();
											})
										.catch(function(err){
											throw err;
										})
						})

}

var addNewSymbols = function(id, symbollist){

		return new Promise(function(resolve, reject){
										enums.dbCall()
										.then(function(db){
													db.collection(enums.tableName.WatcherData)
													.updateOne(
																{'id':id},
																{$addToSet:{'data':{$each:symbollist}}}
																);
													return db;
	
										})
										.then(function(db){
												console.log("updated "+symbollist+ ' for '+id);
												db.close();
												resolve();
											})
										.catch(function(err){
												reject();
											throw err;
										})
						})
}



/*
var removeFromWatcherData = function(id, symbol)
{
	console.log("removing "+symbol+" from "+id);
	var watcher = getCurrentTemplateData(id).data;
	for(var i = 0; i < watcher.length; i++){
		if (watcher[i].symbol == symbol) {
			watcher.splice(i,1);
			break;
		}
	}
	updateWatcherData(id, watcher);
	
}


var getRawTemplate = function(templateId){
	var watcherTemplates = common.readAll(watcherTemplatesFileName);
	var template = {}
	for(idx in watcherTemplates){
		if (watcherTemplates[idx].templateId == templateId) {
			template = watcherTemplates[idx];
			break;
		}
	}
	return template;
}
*/


exports.getCurrentTemplateData = getCurrentTemplateData;
exports.getCurrentTemplate = getCurrentTemplate;
exports.getAllTemplateName = getAllTemplateName
exports.updateWatcherData = updateWatcherData
//exports.removeFromWatcherData = removeFromWatcherData;
//exports.buildMetaData = buildMetaData;
//exports.getMaxTemplateId = getMaxTemplateId;
exports.persistTemplate = persistTemplate;
exports.persistWatcherData = persistWatcherData;
//exports.getRawTemplate = getRawTemplate;
exports.getSymbols = getSymbols
exports.addNewSymbols = addNewSymbols