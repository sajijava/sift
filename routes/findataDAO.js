var common = require('./common');
var yahooFinance = require('yahoo-finance');
var _ = require('lodash');
var fieldSrc = require('./fieldSource');
var math = require('mathjs')
var enums = require('./Enums');

var statmtFolder = 'finStatmt/'

var getDataFromYahoo = function(symbols, sourceFlds){
	
	//console.log(sourceFlds);
	// find attributed based on sourceFlds
	var attributes = getYahooFieldAttr(sourceFlds);
	//console.log(sourceFlds);
	console.log(_.keys(attributes));
	return yahooFinance.snapshot({
		symbols: symbols,
		fields: _.keys(attributes)  // ex: ['s', 'n', 'd1', 'l1', 'y', 'r']
		}, function (err, snapshot) {

			console.log(snapshot);			
			
			
		})
	.then(function( data){
		console.log(data);
		return mapQuoteSnapShot(data,attributes)
	});
	
	
}


// get all yahoo attribute e.g. l1: { field: 'close', value: 0 },
var getYahooFieldAttr = function(sourceFlds){ return getFieldsBySourceType(sourceFlds,enums.datasource.Quote); }
var getFinStatmentFields = function(sourceFlds){ return getFieldsBySourceType(sourceFlds,enums.datasource.Fin); }

var getFieldsBySourceType = function(sourceFlds,fieldSourceType){
	var attributes = {}
	
	for(idx in sourceFlds){
			var src = sourceFlds[idx]
			if (!_.isUndefined(fieldSrc[src]) && fieldSrc[src].source == fieldSourceType) {
		
				attributes[fieldSrc[src].attribute] = {"field":src,"value":0};
			}
		}

		
	return attributes;
}


// map the values of the attributes from yahoo to fields in templates.
var mapQuoteSnapShot = function(snapshot,attributes){
	var sourceData = {};
			if (!_.isUndefined(snapshot) && _.isArray(snapshot)) {
				for(idx in snapshot){
					
					var resp = snapshot[idx];
					//console.log("*"+resp)
					sourceData[resp.symbol] = {}
					var key = _.keys(attributes)
					for(id in key){
						
						var obj = attributes[key[id]].field;
						var row = {};
						
						sourceData[resp.symbol][obj]  = resp[key[id]];
					}
					
				}
			}
		//	console.log(sourceData)
			return sourceData;
	
}
var createRow = function(template, data,formatting){

	var row = _.clone(template);
	//console.log("row "+JSON.stringify(row));
	//console.log(Object.prototype.toString.call(row[0])+row[0]);
	//console.log(row);
	for (item in row) {
		//console.log(row[item].name);
			
		if (_.isUndefined(row[item].formula)) {
				row[item]["data"] = data[row[item].name];
		//console.log(row[item]	)
		}else if (row[item].type == "D") {
				
		}else{
				try{
					//console.log(row[item].formula);
					
					var res = round(math.eval(row[item].formula, data));
					row[item]["data"] = (isNaN(res))?0:res;
					//console.log(JSON.stringify(row[item]))
				}catch(e)
				{
					row[item]["data"] = 0;
					console.error(e);	
				}
				//so the calculated value is set back in data to be reused
				data[row[item].name] = row[item]["data"];
		}
		//console.log(row[item].data);
		// apply column formatting
		if (!_.isUndefined(formatting)) {
			if (!_.isUndefined(formatting[row[item].name])) {
				var conditions = formatting[row[item].name];
				for(condIdx in conditions){
					var result = math.eval(conditions[condIdx].cond, data);
					if (result) {
						row[item]["style"] = conditions[condIdx].style;
					}
				}
			}
		}
		
		if (_.isUndefined(row[item]["data"])) {
			row[item]["data"] = "";
		}
		
	}
	//console.log(formatting["row"]);
	//console.log(_.isUndefined(formatting["row"]));
	// apply row formatting
	if (!_.isUndefined(formatting)) {
		if (!_.isUndefined(formatting["row"])) {
			var conditions = formatting["row"];
			for(condIdx in conditions){
				var result = 0;
				try{
					result = math.eval(conditions[condIdx].cond, data);
				}catch(e){
					console.log(e);
				}
				if (result) {
					row[0]["rowStyle"] = conditions[condIdx].style;
				}
			}
		}
	}


	return row;	
}

var mergeMap = function(map1, arrMap){
	
	var sourceMap = arrMap;
	//console.log(arrMap);
	for(k in sourceMap)
	{
		
			//console.log(k);
			//console.log(sourceMap[k]);
			map1[k] = sourceMap[k];
		
	}
}

var round = function(digit)
{
	return digit.toFixed(2);
}

var createFinStatment = function(symbol, data){
	console.log("creating fin statement "+symbol);
	if (!_.isUndefined(data)) {
		
		enums.dbCall()
		.then(function(db){
			db.collection(enums.tableName.FinDataConsolidated)
			.insertOne(data);
			})
	}
}


var getFinStatment = function(symbols){
	
	var filter = {}
	if(_.isArray(symbols))
	{
		filter = {$or:symbols.map(function(s){
														return {'symbol':s}
													})
						};
		
	}else{
		filter = {'symbol':symbols};
	}
	
	console.log(filter);
	
	return enums.getData(enums.tableName.FinDataConsolidated,filter);
}
/*
var fetchData = function(symbol, callbkFn){
	var completeFileName = statmtFolder+symbol+'.json'
	return common.createIfNotFileExist(completeFileName,callbkFn);
}*/

var getSampleQuoteData = function(){
	
	var srcFlds = [];
	_.keys(fieldSrc).forEach(function(f){
			if (fieldSrc[f].source == enums.datasource.Quote) {
				srcFlds.push(f)
			}
		})
	
	
	return enums.getData(enums.tableName.SampleQuoteData)
				.then(function(data){
				if (_.isUndefined(data) || _.isEmpty(data)) {
					//get Data
					return getDataFromYahoo(enums.sampleSymbols,srcFlds)
								.then(function(d){
									// if data returned persist it.
									if (!_.isUndefined(d) && !_.isEmpty(d)) {
										enums.dbCall()
										.then(function(db){
												db.collection(enums.tableName.SampleQuoteData)
												.insertOneAsync(d);
											})
										return d;
									}else{
										return null;
									}
								})
				}else{
					return data;
				}
				});

         
}

exports.createRow = createRow;
//exports.getYahooKeys = getYahooKeys;
exports.getFinStatmentFields = getFinStatmentFields;
exports.mapQuoteSnapShot = mapQuoteSnapShot;
exports.getDataFromYahoo = getDataFromYahoo;
exports.mergeMap = mergeMap;
exports.createFinStatment = createFinStatment;
exports.getFinStatment = getFinStatment;
//exports.fetchData = fetchData;
exports.getSampleQuoteData = getSampleQuoteData;