var common = require('./common');
var fieldSrc = require('./fieldSource');
var _ = require('lodash');

var watcherTemplatesFileName= 'WatcherTemplates.json';
var watcherDataFileName = "WatcherData.json";

var watcher = {};

var templateStruct = {};

var watcherData = [];



var loadData = function(){
	watcherData = common.readAll(watcherDataFileName);
	//console.log(watcherData)
}

// this shouldn be cached
loadTemplates = function(){
	var watcherTemplates = common.readAll(watcherTemplatesFileName);

	watcher = {};
	for (template in watcherTemplates) {
		var id = watcherTemplates[template].id;
		var metaData = buildMetaData(watcherTemplates[template].table);
		
		watcher[id] = {
										"name":watcherTemplates[template].name,
										"template":watcherTemplates[template].table,
										"formatting":watcherTemplates[template].formatting,
										"header":metaData.header,// only the header
										"sourceFlds":metaData.sourceFlds // find all source fields
										
									};
	}
	;
	//console.log(watcher);
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
				sourceFlds[row.name] = {};
			}else{
				sourceFlds[row.name] = {};
				parseFormula(row.formula,sourceFlds,inputFlds);
			}
		}
		
	
	}
	return {"header":header,"sourceFlds":sourceFlds};
}

// parse formula and add the fields to sourceFld or inputFld list
var parseFormula = function(formula, sourceFlds,inputFlds){

	for(field in fieldSrc)
	{
		if(formula.indexOf(field) > 0)
		{
			if(_.isUndefined(sourceFlds[field]) && _.isUndefined(inputFlds[field]))
			{
				sourceFlds[field] = {};
			}
		}
	}
	return formula;
}

var getCurrentTemplate = function(templateId){
	loadTemplates();
	var currentTemplate = watcher[templateId];
	return currentTemplate;
}

var getAllTemplates = function(){
	loadTemplates();
	return watcher;
}
var getMaxTemplateId = function(){
	loadTemplates();
	
	var maxId = 0;
	for (temp in watcher){
		var tempId = +temp
			if (tempId > maxId) {
				maxId = tempId;
			}
	}
	return maxId;
	
}
// saved data for the template
var getCurrentTemplateData = function(templateId){
	var currentTemplateData = {};
	
	loadData();
	for (watcher in watcherData) {
		if (watcherData[watcher].id == templateId) {
			currentTemplateData = watcherData[watcher];
			break;
		}
	}
	return currentTemplateData;
}


var updateWatcherData = function(id, updatedData){
	loadData();
	for (watcher in watcherData) {
		if (watcherData[watcher].id == id) {
			watcherData[watcher].data = updatedData;
			break;
		}
	}
	common.writeJsonFile(watcherDataFileName,watcherData);	
}


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

var persistTemplate = function(template){
	var watcherTemplates = common.readAll(watcherTemplatesFileName);

	var hasTemplate = false;
	for(idx in watcherTemplates){
		if (watcherTemplates[idx].id == template.id) {
			watcherTemplates[idx] = template;
			hasTemplate = true;
			break;
		}
	}
	if (!hasTemplate) {
		watcherTemplates.push(template);	
	}
	
	common.writeJsonFile(watcherTemplatesFileName,watcherTemplates);
	
}
var getRawTemplate = function(templateId){
	var watcherTemplates = common.readAll(watcherTemplatesFileName);
	var template = {}
	for(idx in watcherTemplates){
		if (watcherTemplates[idx].id == templateId) {
			template = watcherTemplates[idx];
			break;
		}
	}
	return template;
}

exports.getCurrentTemplateData = getCurrentTemplateData;
exports.getCurrentTemplate = getCurrentTemplate;
exports.getAllTemplates = getAllTemplates
exports.updateWatcherData = updateWatcherData
exports.removeFromWatcherData = removeFromWatcherData;
exports.buildMetaData = buildMetaData;
exports.getMaxTemplateId = getMaxTemplateId;
exports.persistTemplate = persistTemplate;
exports.getRawTemplate = getRawTemplate;