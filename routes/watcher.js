var Promise = require('bluebird');
var fieldSrc = require('./fieldSource');
var dao = require('./watcherDAO');
var findataDAO = require('./findataDAO');

var _ = require('lodash');
var enums = require('./Enums');
var Debug = require('debug');

var MILLION = 1000000;

Debug.enable('yahoo-finance:*')

// list of all the watchers  names that are available
// this could be used for the drop down in UI
var getWatcherList = function(req, res){
		
		var watcherNames = [];
		
		dao.getAllTemplateName()
		.then(function(rows){
			rows.forEach(function(d){
					watcherNames.push({"id":d.templateId,"name":d.name});
				})
			console.log(watcherNames);
			res.json(watcherNames);	
		})
}

// get data for a single watcher. the request param should contain the id of watcher template
var getWatcherData = function(req, res){

	var errorCode = "";

	var dataObject = {};

	var fetchSymbols = function(dataObject){
				console.log("get All symbols for "+dataObject.id)

				return dao.getSymbols(dataObject.id)
									.then(function(symbolList){
										dataObject['symbols'] = symbolList;
										return dataObject;
								})
			}
			
	var fetchQuote = function(dataObject){

			console.log("GetData from Yahoo..."+dataObject.symbols);

			return dao.getCurrentTemplate(id)
								.then(function(template){
									var src = _.keys(template[0].sourceFlds)
									dataObject['currTemplate'] = template[0];
									 
									 return findataDAO.getDataFromYahoo(dataObject.symbols,src)
									.then(function(d){
										dataObject['quoteData'] = d;
										return dataObject;	
									});
									
								})
		
	}

	
	var fetchFinancials = function(dataObject){
		//console.log("get Statement Data"+JSON.stringify(dataObject.quoteData));

		return new Promise(function(resolve, reject){
				var src = _.keys(dataObject.currTemplate.sourceFlds)
				var finAttributes = findataDAO.getFinStatmentFields(src)
				console.log(finAttributes);
				
				
				
				findataDAO.getFinStatment(_.keys(dataObject.quoteData))
				.then(function(finStmts){
						finStmts.forEach(function(finStmt){
							console.log(finStmt.companyname+','+finStmt.symbol)
							var symbol = finStmt.symbol;
							
							if (!_.isUndefined(finStmt) && !_.isEmpty(finStmt.quarters)) {
								_.keys(finAttributes).forEach(function(a){
										//console.log(finStmt.quarters[0]);
										if (finStmt.quarters[0][a] == null) {
											dataObject.quoteData[symbol][a] = 0;
										}else{
											if (fieldSrc[a].type == enums.datatype.Currency) {
												dataObject.quoteData[symbol][a] = finStmt.quarters[0][a];
											}else {
											dataObject.quoteData[symbol][a] = finStmt.quarters[0][a];
										}
									
									}
								})
							}	
							
						});
						
						resolve(dataObject)
				})
				
				
		});

	}
	
	var prepareForUI = function(dataObject){
		//console.log("prepare for UI"+JSON.stringify(dataObject.quoteData));
		
		var table = [];
		dao.getCurrentTemplateData(dataObject.id)
		.then(function(d){
				//console.log(d[0]);
				var currentTemplate = d;
				var template = dataObject.currTemplate.template;
				var formatting = dataObject.currTemplate.formatting;
				//console.log(dataObject.currTemplate);
				for (idx in currentTemplate.data) {
						////console.log("watcher " +watcher)
						var data = currentTemplate.data[idx];
						var mktData = dataObject.quoteData[data.symbol];
						if (!_.isUndefined(mktData)) {
							findataDAO.mergeMap(data, mktData);
						}
						
						//console.log(data);
						var row = findataDAO.createRow(template,data,formatting)
						console.log("**************");
						//console.log(row);
						table.push(row);		
					}
				//onsole.log(table);	
				res.json(table);			
			})
		
	}
	
	
	if (_.isUndefined(req.params.watcherId)) {
		res.JSON(enums.errorCodes.EmptyWatcherId);
	}else{
		var id = req.params.watcherId;
	
		dataObject['id'] = id;

		return fetchSymbols(dataObject)
					.then(fetchQuote)
					.then(fetchFinancials)
					.then(prepareForUI)
	 
	}
	
	


	
	//var currentTemplate = dao.getCurrentTemplateData(id);
	/*
	//console.log("***"+id);
	return new Promise(function(resolve, reject){
				var currentTemplate = da//o.getCurrentTemplateData(id);
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
		})
		
		;
		*/
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


	if (!_.isUndefined(symbols) ) {
		var symbArr = symbols.split(",");
	}	
	console.log("***"+symbols);
	dao.getCurrentTemplate(id)
	.then(function(t){
			//console.log(t[0].template)
			var newTemplateObj = {}
			
			t[0].template.forEach(function(tl){
					if (tl.source == enums.datasource.Input) {
						newTemplateObj[tl.name] = "";
					}
			});
		
			if (symbArr.length > 0){
					var newRows = []
					symbArr.forEach(function(d){
							var newRow = _.clone(newTemplateObj);
							newRow.symbol =  d
							newRows.push(newRow);
					})
			}
			
			console.log(newRows);
			dao.addNewSymbols(id,newRows)
			.then(function(){
				res.json({"success":"true"});		
			})
			
	})

	
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
	dao.updateWatcherData(id,updatedData)
	.then(function(){res.json({"success":"true"});});
	
	
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