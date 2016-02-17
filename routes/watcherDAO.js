var Promise = require('bluebird');
var common = require('./common');
var fieldSrc = require('./fieldSource');
var _ = require('lodash');
var assert = require('assert');
var enums = require('./Enums');
var rawTemplateModel = require('./model/userRawTemplateModel')
var userTemplateModel = require('./model/userTemplateModel')
var userTemplateDataModel = require('./model/userTemplateDataModel')



var watcherTemplatesFileName= 'WatcherTemplates.json';

var watcherDataFileName = "WatcherData.json";

var watcher = {};

var templateStruct = {};

var watcherData = [];

var loadData = function(){
	watcherData = common.readAll(watcherDataFileName);
	//console.log(watcherData)
	watcherData.forEach(function(d){
		d['templateId'] = '1';
		var newData = new  userTemplateDataModel(d);
	  newData.save(function (err) {if (err) console.log ('Error on save!')});
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
	
	/*enums.dbCall()
	.then(function(db){
			db.collection(enums.tableName.RawTemplate)
				.insertOneAsync(template);
			
			return db;
	})*/
	
	var newTemplate = new rawTemplateModel(template);
	newTemplate.save()
	/*.then(function(db){
			var watchertemp = buildWatcherTemplates(template);
			
			db.collection(enums.tableName.WatcherTemplate)
					.insertOne(watchertemp);
					
			return db;		
	})
	.then(function(db){
			db.close();
		})*/
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
	//return enums.getData(enums.tableName.WatcherTemplate,{"templateId":templateId});
	return userTemplateModel.getOneTemplate(templateId)
}

var getAllTemplateName = function(callbackFn){
	//loadData();
	return userTemplateModel.getAllTemplates();

}

var getSymbols = function(templateId){
	
	return new Promise(function(resolve, reject){
				//enums.getData(enums.tableName.WatcherData,{'id':templateId},{"data.symbol":1,"_id":0})
				userTemplateDataModel.getSymbolsForTemplate(templateId)
				.then(function(d){
					   console.log();
						var symbolList = [];
						
						if (!_.isEmpty(d)) {
							d.data.forEach(function(d){	symbolList.push(d.symbol)});
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
var getNextTemplateId =	 function(){


	return enums.dbCall()
	.then(function(db){
			return db.collection(enums.tableName.WatcherTemplate)
			.aggregateAsync([{$group:{_id:'','max':{$max:'$templateId'}}}])
			.then(function(result){
				console.log(result);
				
				if (!_.isUndefined(result[0].max)) {
					var maxId = +result[0].max;
					return (maxId + 1).toString();
				}else{
					return "1";
				}
			})
		})
	
}
// saved data for the template
var getCurrentTemplateData = function(templateId){
	
	console.log(templateId)
	//return enums.getData(enums.tableName.WatcherData,{'id':templateId})
	return userTemplateDataModel.getDataForTemplate(templateId);

}


var updateWatcherData = function(id, updatedData){
	
	
		return new Promise(function(resolve, reject){
			
										var filter = {'templateId':id};
										userTemplateDataModel.findOneAndUpdate(filter,{$set:{'data':updatedData}},function(err, val){
												if (err) {
													throw err;
												}else{
													resolve(val);
												}
											});
										
						})
}

var addNewSymbols = function(id, symbollist){

	return new Promise(function(resolve, reject){
				
				userTemplateModel.getOneTemplate(id)
					.then(function(wkspc){
						console.log("then 1")
						return wkspc.template;
					})		
					.then(function(template){
						console.log("then 2")
							var symbols = [];
				
							
							var newTemplateObj = {}
							template.forEach(function(tl){
									if (tl.source == enums.datasource.Input) {
										newTemplateObj[tl.name] = "";
									}	
								})
				
							if (_.isArray(symbollist)) {
								
								symbols = symbollist.map(function(temp){
																												
																												var newTemp = _.clone(newTemplateObj);
																												newTemp.symbol = temp;
																												return newTemp;
																											})
				
							}else{
				
									var newTemp = _.clone(newTemplateObj);
									newTemp.symbol = symbollist;
									symbols.push(newTemp);
									
							}
				
							userTemplateDataModel.getDataForTemplate(id)
							.then(function(d){
								
								
								
										d.data.push(symbols[0]);
										d.save();
										resolve(true)
								})
							
						})
					.catch(function(err){
						console.log(err)
						revoke(false)
					})				
		})
  
	

}




var removeFromWatcherData = function(id, symbol)
{
	console.log("removing "+symbol+" from "+id);

	return userTemplateDataModel.getDataForTemplate(id)
	.then(function(template){
		var currData = template.data;
		for(var i = 0; i < currData.length; i++){
			if (currData[i].symbol == symbol) {
				currData.splice(i,1);
				break;
			}
		}
		return updateWatcherData(id,currData);
	})

}


var getRawTemplate = function(templateId){
	return enums.dbCall()
					.then(function(db){
							return db.collection(enums.tablename.RawTemplate)
							.findAsync({'templateId':templateId})
							.then(function(cursor){
								return cursor.toArrayAsync();
								})
							
						})

}



exports.getCurrentTemplateData = getCurrentTemplateData;
exports.getCurrentTemplate = getCurrentTemplate;
exports.getAllTemplateName = getAllTemplateName
exports.updateWatcherData = updateWatcherData
exports.removeFromWatcherData = removeFromWatcherData;
exports.buildMetaData = buildMetaData;
//exports.getNextTemplateId = getNextTemplateId;
//exports.persistTemplate = persistTemplate;
//exports.persistWatcherData = persistWatcherData;
exports.getRawTemplate = getRawTemplate;
exports.getSymbols = getSymbols
exports.addNewSymbols = addNewSymbols