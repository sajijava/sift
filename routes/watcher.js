
var fieldSrc = require('./fieldSource');
var dao = require('./watcherDAO');
var findataDAO = require('./findataDAO');
var Promise = require('bluebird');
var _ = require('lodash');
var enums = require('./Enums');

var MILLION = 1000000;


// list of all the watchers  names that are available
// this could be used for the drop down in UI
var getWatcherList = function(req, res){
		//console.log("in watcherList");
		
		var watcherNames = [];
		var watcher = dao.getAllTemplates();
		for (watch in watcher) {
			////console.log("***"+watch);
			////console.log(watcher[watch]);
			watcherNames.push({"id":watch,"name":watcher[watch].name});
			
		}
		//console.log(watcherNames)
		res.json(watcherNames);
}

// get data for a single watcher. the request param should contain the id of watcher template
var getWatcherData = function(req, res){

	var id = req.params.watcherId;
	
	//console.log("***"+id);
	return new Promise(function(resolve, reject){
				var currentTemplate = dao.getCurrentTemplateData(id);
				////console.log(currentTemplate);
				resolve(getSymbols(currentTemplate.data))
		}).then(function(symbols){ // get Quote data from Yahoo
				//console.log("GetData from Yahoo...");
				////console.log(symbols);
				var src = dao.getCurrentTemplate(id).sourceFlds
				return findataDAO.getDataFromYahoo(symbols,src)

		}).then(function(snapshot){ //relabel yahoo data
				//console.log("Relabel yahoo data");
				// get all source field from template e.g. close: {},
				var src = dao.getCurrentTemplate(id).sourceFlds
				////console.log(src);
				var attributes = findataDAO.getYahooKeys(src)
				//.log(attributes);
				////console.log(snapshot);
				return {'sourceData':findataDAO.mapQuoteSnapShot(snapshot,attributes),'sourceFields':src};
		}).then(function(data){ // get financial Data
				console.log("get Statement Data");

				console.log(data.sourceFields);
				var finAttributes = findataDAO.getFinStatmentFields(data.sourceFields)
				console.log(finAttributes);
				for(key in data.sourceData){
					var finStmt = findataDAO.readFinStatment(key);
					if (!_.isUndefined(finStmt)) {
						_.keys(finAttributes).forEach(function(a){
								if (finStmt.quarters[0][a] == null) {
									data.sourceData[key][a] = 0;
								}else{
									if (fieldSrc[a].type == enums.datatype.Currency) {
										data.sourceData[key][a] = finStmt.quarters[0][a]/MILLION;
									}else {
										data.sourceData[key][a] = finStmt.quarters[0][a];
									}
									
								}
							})
					}
				}
////console.log(data.sourceData);
				return data.sourceData;
		}).then(function(sourceData){
				//console.log("build data grid");
		//		//console.log(sourceData);
				var table = [];
				var currentTemplate = dao.getCurrentTemplateData(id);
				var template = dao.getCurrentTemplate(id).template;
				var formatting = dao.getCurrentTemplate(id).formatting;
				for (idx in currentTemplate.data) {
						////console.log("watcher " +watcher)
						var data = currentTemplate.data[idx];
						findataDAO.mergeMap(data, sourceData);
						//console.log(data);
						var row = findataDAO.createRow(template,data,formatting)
						////console.log("**************");
						////console.log(row);
						table.push(row);		
					}
				////console.log(table);	
				res.json(table);				
		});
}


var getSymbols = function(data){
	var symbols = [];
	for (watcher in data) {
		symbols.push(data[watcher].symbol);
		
	}
	//console.log(data);
	//console.log(symbols);
	return symbols;
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

var addNewWatcherData = function(req, res){

	var symbols = req.params.symbols;
	var id = req.params.watcherId;
	
	//console.log("***"+symbols);
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
				////console.log(content[row][col].name+" "+ content[row][col].data);
				updatedRow[content[row][col].name] = content[row][col].data
			}
		}
		updatedData.push(updatedRow);
	}
	////console.log(updatedData);
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