
var fieldSrc = require('./fieldSource');
var dao = require('./watcherDAO');
var Promise = require('bluebird');
var findataDAO = require('./findataDAO');



var getFieldSource = function(req, res){
	var fieldList = [];
	
	for(item in fieldSrc){
		var field = fieldSrc[item];
		field.name = item;
		fieldList.push(field);
	}
	
	res.json(fieldList)
}
var getTemplateObject = function(req, res){
	res.json( { "id":""
		,"name":""
		,"table":[{"header":"Symbol","name":"symbol","order":0,"source":"I", "size":6}]
		,"formatting":{}
	});
}

var getSampleData = function(req,res){
	var sampleSymbols = ["AAPL","YHOO","GOOG","NFLX"];
	var template = req.body;
	var templateMetaData = dao.buildMetaData(template.table);
	console.log("**************** getSampleData **************");
	console.log(template);
	console.log(templateMetaData);
	
	return new Promise(function(resolve, reject){
				var src = templateMetaData.sourceFlds
				resolve(findataDAO.getDataFromYahoo(sampleSymbols,src));

		}).then(function(snapshot){ //relabel yahoo data
				console.log("second then");
				var src = templateMetaData.sourceFlds
				var attributes = findataDAO.getYahooKeys(src)
				return findataDAO.mapQuoteSnapShot(snapshot,attributes);

		}).then(function(sourceData){
				console.log("Third then");
				//console.log(sourceData);
				var table = [];
				var currentTemplate = templateMetaData;
				var formatting = template.formatting;
				for (idx in sampleSymbols) {
						//console.log("watcher " +watcher)
						var data = {"symbol":sampleSymbols[idx]};
						findataDAO.mergeMap(data, sourceData);
						console.log(data);
						var row = findataDAO.createRow(template.table,data,formatting)
						//console.log("**************");
						console.log(row);
						table.push(row);		
					}
					
				console.log(table);	
				res.json(table);				
		});
	
}

exports.setRESTInterfaces = function(app){
	
	app.get('/api/get/template/fieldlist', getFieldSource);
	app.get('/api/get/template/object',getTemplateObject);
	
	
	app.post('/api/get/template/sampledata', getSampleData);
	
	
}