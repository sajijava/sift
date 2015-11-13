
var fieldSrc = require('./fieldSource');
var dao = require('./watcherDAO');



var getFieldSource = function(req, res){
	var fieldList = [];
	
	for(item in fieldSrc){
		var field = fieldSrc[item];
		field.name = item;
		fieldList.push(field);
	}
	
	res.json(fieldList)
}

exports.setRESTInterfaces = function(app){
	
	app.get('/api/get/template/fieldlist', getFieldSource);
	
	
}