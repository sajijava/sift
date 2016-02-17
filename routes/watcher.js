var Promise = require('bluebird');
var fieldSrc = require('./fieldSource');
var dao = require('./watcherDAO');
var findataDAO = require('./findataDAO');


var _ = require('lodash');
var enums = require('./Enums');
var Debug = require('debug');
var common = require('./common');

var MILLION = 1000000;

Debug.enable('yahoo-finance:*')

// list of all the watchers  names that are available
// this could be used for the drop down in UI
var getWatcherList = function(req, res){
		
		var watcherNames = [];
		
		dao.getAllTemplateName()
		.then(function(rows){
			console.log(rows);
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
/*			
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
*/
	/*
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
	*/
	var prepareForUI = function(dataObject){
		console.log("prepare for UI");//+JSON.stringify(dataObject.quoteData));
		
		var table = [];
		dao.getCurrentTemplateData(dataObject.id)
		.then(function(d){
				//console.log(JSON.stringify(d));
				var currentTemplate = d;
				var template = dataObject.currTemplate.template;
				var formatting = dataObject.currTemplate.formatting;
				//console.log(template);
				for (idx in currentTemplate.data) {
						////console.log("watcher " +watcher)
						var data = currentTemplate.data[idx];
						var mktData = dataObject.quoteData[data.symbol];
						if (!_.isUndefined(mktData)) {
							findataDAO.mergeMap(data, mktData);
						}
						
						//console.log(data)
						//console.log(template);
						var row = findataDAO.createRow(template,data,formatting)
						console.log("**************");
						//console.log(row[0][0].data);
						table.push(row);		
					}
				//console.log(table);	
				res.json({"errorCode":enums.errorCode.success,"data":table});			
			})
		
	}
	
	
	if (_.isUndefined(req.params.watcherId)) {
		res.JSON(enums.errorCodes.EmptyWatcherId);
	}else{
		var id = req.params.watcherId;
	
		dataObject['id'] = id;

		return fetchSymbols(dataObject)
					.then(common.fetchQuote)
					.then(common.fetchFinancials)
					.then(prepareForUI)
					.catch(function(){
						res.json({"errorCode":enums.errorCode.NoDataFound,"data":[]});			
					})
	 
	}

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
		dao.addNewSymbols(id,symbArr)
		.then(function(){
			res.json({"success":"true"});		
		})
	}
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
	//console.log(updatedData);
	if (!_.isEmpty(updatedData)) {

			dao.updateWatcherData(id,updatedData)
			.then(function(val){
					res.json({"success":"true"});
			});
	}
	
}
var removeFromWatcherData = function(req, res){
	var id = req.params.watcherId;
	var symbol = req.params.symbol;
	dao.removeFromWatcherData(id, symbol).
	then(function(){
		res.json({"success":"true"})
	})
	
	
}

exports.setRESTInterfaces = function(app){
	
	app.get('/api/get/watcher/list', getWatcherList);
	app.get('/api/get/watcher/data/:watcherId', getWatcherData);
	app.get('/api/watcher/add/:watcherId/:symbols', addNewWatcherData);
	app.get('/api/watcher/remove/:watcherId/:symbol', removeFromWatcherData);

	app.post('/api/watcher/save/:watcherId', saveWatcherData);

	
}