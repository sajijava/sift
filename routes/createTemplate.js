var enums = require('./Enums');
var fieldSrc = require('./fieldSource');
var dao = require('./watcherDAO');
var Promise = require('bluebird');
var findataDAO = require('./findataDAO');
var _ = require('lodash');


var getFieldSource = function(req, res){
	var fieldList = [];
	
	for(item in fieldSrc){
		var field = fieldSrc[item];
		field.name = item;
		fieldList.push(field);
	}
	fieldList.sort(function(a,b){
			var x = a.desc.toLowerCase();
			var y = b.desc.toLowerCase();
			return x < y ? -1 : x > y ? 1 : 0;
		})
	res.json(fieldList)
}
var getTemplateObject = function(req, res){

	console.log(req.params);
	var id = req.params.watcherid;
	
	console.log("get template for id "+id);
	var template = {};
	if (!_.isUndefined(id) && id != 'undefined' && _.trim(id).length > 0){
		template = dao.getRawTemplate(id);
	}else{
		template = { "id":dao.getMaxTemplateId()+1
									,"name":""
									,"table":[{"header":"Symbol","name":"symbol","order":0,"source":"I", "size":6}]
									,"formatting":{}
								};
	}
	
	res.json(template);
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
				var returnObj = {};
				if (!_.isEmpty(src)) {
					returnObj = findataDAO.getDataFromYahoo(sampleSymbols,src);
				}
				 
				resolve(returnObj);

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
		//				console.log(data);
						var row = findataDAO.createRow(template.table,data,formatting)
						//console.log("**************");
			//			console.log(row);
						table.push(row);		
					}
					
			//	console.log(table);	
				res.json(table);				
		});
	
}

var getDataType = function(req, res){
	res.json(enums.datatype);
}

var saveTemplate = function(req, res){
	console.log("prepare to save");
	console.log(req.body);
	dao.persistTemplate(req.body);
	res.json({success:true});
}

var getMathOperation = function(req, res){
	var mathOperations = {};
	mathOperations["operations"] = ["+","-","*","/","^"];
	mathOperations["functions"] = ["abs(x)","ceil(x)","exp(x)","floor(x)","log(x [, base])","log10(x)","round(x [, n])","sqrt(x)"]
	mathOperations["functions"].sort();
	res.json(mathOperations);
}
exports.setRESTInterfaces = function(app){
	
	app.get('/api/get/template/fieldlist', getFieldSource);
	app.get('/api/get/template/object/:watcherid',getTemplateObject);
	app.get('/api/get/template/datatypes', getDataType);
	app.get('/api/get/template/mathops', getMathOperation);
	
	app.post('/api/get/template/sampledata', getSampleData);
	app.post('/api/get/template/savetemplate', saveTemplate);
	
	
}