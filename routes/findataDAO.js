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
	var attributes = getYahooKeys(sourceFlds);
	//console.log(sourceFlds);
	console.log(attributes);
	return yahooFinance.snapshot({
		symbols: symbols,
		fields: _.keys(attributes)  // ex: ['s', 'n', 'd1', 'l1', 'y', 'r']
		}, function (err, snapshot) {

			console.log(snapshot);			
			
			
		});
	
	
}


// get all yahoo attribute e.g. l1: { field: 'close', value: 0 },
var getYahooKeys = function(sourceFlds){ return getFieldsBySourceType(sourceFlds,enums.datasource.Quote); }
var getFinStatmentFields = function(sourceFlds){ return getFieldsBySourceType(sourceFlds,enums.datasource.Fin); }

var getFieldsBySourceType = function(sourceFlds,fieldSourceType){
	var attributes = {}
	
	for(src in sourceFlds){
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
					sourceData[resp.symbol] = {}
					var key = _.keys(attributes)
					for(id in key){
						
						var obj = attributes[key[id]].field;
						var row = {};
						
						sourceData[resp.symbol][obj]  = resp[key[id]];
					}
					
				}
			}
			return sourceData;
	
}
var createRow = function(template, data,formatting){

	var row = _.clone(template,true);

	//console.log(template);
	for (item in row) {
			
		if (_.isUndefined(row[item].formula)) {
				row[item]["data"] = data[row[item].name];
		}else if (row[item].type == "D") {
				
		}else{
				try{
					var res = round(math.eval(row[item].formula, data));
					row[item]["data"] = (isNaN(res))?0:res;
					data[row[item].name] = row[item]["data"];
				}catch(e)
				{
					row[item]["data"] = "";
					console.error(e);	
				}
		}
		
		// apply column formatting
		if (!_.isUndefined(formatting[row[item].name])) {
			var conditions = formatting[row[item].name];
			for(condIdx in conditions){
				var result = math.eval(conditions[condIdx].cond, data);
				if (result) {
					row[item]["style"] = conditions[condIdx].style;
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
	if (!_.isUndefined(formatting["row"])) {
		var conditions = formatting["row"];
		for(condIdx in conditions){
			var result = math.eval(conditions[condIdx].cond, data);
			if (result) {
				row[0]["rowStyle"] = conditions[condIdx].style;
			}
		}
	}


	return row;	
}

var mergeMap = function(map1, arrMap){
	
	var sourceMap = arrMap[map1.symbol];

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

var persistFinStatment = function(symbol, data){
	if (data != null) {
		var completeFileName = statmtFolder+symbol+'.json'
		common.writeJsonFile(completeFileName,data);	
	}
}
var readFinStatment = function(symbol){
	var stmtData = undefined;
	var completeFileName = statmtFolder+symbol+'.json'
	stmtData = common.readAll(completeFileName);
	return (_.isEmpty(stmtData))?undefined:stmtData;
}

var fetchData = function(symbol, callbkFn){
	var completeFileName = statmtFolder+symbol+'.json'
	return common.createIfNotFileExist(completeFileName,callbkFn);
}
exports.createRow = createRow;
exports.getYahooKeys = getYahooKeys;
exports.getFinStatmentFields = getFinStatmentFields;
exports.mapQuoteSnapShot = mapQuoteSnapShot;
exports.getDataFromYahoo = getDataFromYahoo;
exports.mergeMap = mergeMap;
exports.persistFinStatment = persistFinStatment;
exports.readFinStatment = readFinStatment;
exports.fetchData = fetchData;