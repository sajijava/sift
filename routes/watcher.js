
var fieldSrc = require('./fieldSource');
var dao = require('./watcherDAO');
var yahooFinance = require('yahoo-finance');
var Promise = require('bluebird');
var _ = require('lodash');
var math = require('mathjs')


// list of all the watchers  names that are available
// this could be used for the drop down in UI
var getWatcherList = function(req, res){
		console.log("in watcherList");
		
		var watcherNames = [];
		var watcher = dao.getAllTemplates();
		for (watch in watcher) {
			//console.log("***"+watch);
			//console.log(watcher[watch]);
			watcherNames.push({"id":watch,"name":watcher[watch].name});
			
		}
		console.log(watcherNames)
		res.json(watcherNames);
}

// get data for a single watcher. the request param should contain the id of watcher template
var getWatcherData = function(req, res){

	var id = req.params.watcherId;
	
	console.log("***"+id);
	return new Promise(function(resolve, reject){
				var currentTemplate = dao.getCurrentTemplateData(id);
				resolve(getSymbols(currentTemplate.data))
		}).then(function(symbols){ // get Quote data from Yahoo
				console.log("first then");
				console.log(symbols);
				var src = dao.getCurrentTemplate(id).sourceFlds
				return getDataFromYahoo(symbols,src)

		}).then(function(snapshot){ //relabel yahoo data
				console.log("Third then");
				var src = dao.getCurrentTemplate(id).sourceFlds
				var attributes = getYahooKeys(src)
				return mapQuoteSnapShot(snapshot,attributes);

		}).then(function(sourceData){
				console.log("Third then");
				console.log(sourceData);
				var table = [];
				var currentTemplate = dao.getCurrentTemplateData(id);
				var template = dao.getCurrentTemplate(id).template;
				var formatting = dao.getCurrentTemplate(id).formatting;
				for (idx in currentTemplate.data) {
						//console.log("watcher " +watcher)
						var data = currentTemplate.data[idx];
						mergeMap(data, sourceData);
						//console.log(data);
						var row = createRow(template,data,formatting)
						//console.log("**************");
						//console.log(row);
						table.push(row);		
					}
				//console.log(table);	
				res.json(table);				
		});
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
var getSymbols = function(data){
	var symbols = [];
	for (watcher in data) {
		symbols.push(data[watcher].symbol);
		
	}
	//console.log(symbols);
	return symbols;
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
var round = function(digit)
{
	return digit.toFixed(2);
}
var getDataFromYahoo = function(symbols, sourceFlds){
	
	//console.log(attributes);
	// find attributed based on sourceFlds
	var attributes = getYahooKeys(sourceFlds);
	return yahooFinance.snapshot({
		symbols: symbols,
		fields: _.keys(attributes)  // ex: ['s', 'n', 'd1', 'l1', 'y', 'r']
		}, function (err, snapshot) {

			console.log(snapshot);			
			
			
		});
	
	
}

var getYahooKeys = function(sourceFlds){
	var attributes = {}
	
	for(src in sourceFlds){
			if (!_.isUndefined(fieldSrc[src])) {
				attributes[fieldSrc[src].attribute] = {"field":src,"value":0};
			}
		}

	return attributes;
}

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
var getAttributes = function(srcFlds){
		var fields = [];
		for(src in srcFlds){
			
			if (!_.isUndefined(fieldSrc[src])) {
				fields.push(fieldSrc[src].attribute);
			}
		}
		
		return fields;
		
}

/*
// gird for UI Grid is created from backend.
var convertToUiGrid = function(table,headers){
	var uiGridOptions = {}
	uiGridOptions["enableSorting"] = true;
	uiGridOptions["columnDefs"] = headers;
	uiGridOptions["data"] = table
	return uiGridOptions;
}
// UI Grid cell filters

var getCellFilter = function(type)
{
	
		var cellFilter = "";
		switch(type){
			case 'C':
				cellFilter = "currencyFilter";
				break;
			case 'F':
				cellFilter = "fractionFilter";
				break;
			case 'P':
				cellFilter = "percentFilter";
				break;
			case 'D':
				cellFilter = "date";
				break;
			
		}
		return cellFilter;
}
*/
var addNewWatcherData = function(req, res){

	var symbols = req.params.symbols;
	var id = req.params.watcherId;
	
	console.log("***"+symbols);
	var template = dao.getCurrentTemplate(id).template;
	var watcherData = dao.getCurrentTemplateData(id).data;
	
	var symbArr = symbols.split(",");
	for(sym in symbArr){
		var newRow = {};
		for(item in template){
				if (template[item].source == 'I') {
						newRow[template[item].name] = (template[item].name == "symbol")?symbArr[sym]:"";
				}
		}
		
		watcherData.push(newRow);
	}
		dao.updateWatcherData(id,watcherData);
	
	res.json({"success":"true"});		
}
var saveWatcherData = function(req, res){
	var content = req.body;
	var updatedData = [];
	var id = req.params.watcherId;
	
	for (row in content) {
		var updatedRow = {};
		
		for(col in content[row]){
	
			if (content[row][col].source == 'I') {
				//console.log(content[row][col].name+" "+ content[row][col].data);
				updatedRow[content[row][col].name] = content[row][col].data
			}
		}
		updatedData.push(updatedRow);
	}
	//console.log(updatedData);
	dao.updateWatcherData(id,updatedData);
	res.json({"success":"true"});		
	
}
var removeFromWatcherData = function(req, res){
	var id = req.params.watcherId;
	var symbol = req.params.symbol;
	var response = dao.removeFromWatcherData(id, symbol);
	
	
}

exports.setRESTInterfaces = function(app){
	
	app.get('/api/get/watcher/list', getWatcherList);
	app.get('/api/get/watcher/data/:watcherId', getWatcherData);
	app.get('/api/watcher/add/:watcherId/:symbols', addNewWatcherData);
	app.get('/api/watcher/remove/:watcherId/:symbol', removeFromWatcherData);

	app.post('/api/watcher/save/:watcherId', saveWatcherData);

	
}