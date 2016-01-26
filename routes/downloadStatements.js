var edgarO = require('./edgarOnline');
var dao = require('./watcherDAO');
var _ = require('lodash');
var findataDAO = require('./findataDAO');
var commonDAO = require('./commonDAO');



var downloadAll = function(){
	 commonDAO.getAllSymbols()
	 .then(function(symbols){

			var i = 1;
		
			console.log("Download in....");
			
			symbols.forEach(function(symbol){
					setTimeout(download,2500 * i++,symbol);
			})
		
	 })
}


var download = function(symbol){
	console.log("getting for "+symbol);
		edgarO.getQuarterData3Month(symbol)
		.then(function(response){
			persistResponse(symbol,JSON.parse(response));	
		})

}
var persistResponse = function(symbol, response){
		console.log('^^^^^^^^^^^^^^^^^^^^^');
		console.log(symbol);
		
		findataDAO.getFinStatment(symbol)
		.then(function(d){
			console.log(d);
			var data = translate(response);
			if (_.isUndefined(d) || _.isEmpty(d)) {
				findataDAO.createFinStatment(symbol,data);		
			}else{
				var missingQrt = getMissingQtr(data, d)
				if (_.isUndefined(missingQrt)) {
					data.quarters.push(missingQrt);
					findataDAO.updateFinStatment(symbol, data);
				}
				
			}
		})
		
		console.log('====================');
}

var getMissingQtr = function(newData, existingData){
	return undefined;
}

var translate = function(response){
	var data = {};

	var rows = response.result.rows.map(function(r){
		var obj = {};
		
		for(idx in r.values){
			obj[r.values[idx].field] = r.values[idx].value;
		}

		return obj;
	})
	
	//console.log(_.isEmpty(rows));
	if (!_.isEmpty(rows)) {
		data.companyname = rows[0]['companyname'];
		data.symbol = rows[0]['primarysymbol'];
		data.description = rows[0]['sicdescription'];
		data.quarters = rows;
	}else{
		data = null;
	}
	
	return data;
	
}

var getSymbols = function(){
	var symbols = {};
	var allTemplate = dao.getAllTemplates();
	
	for(templateId in allTemplate){
		var currentTemplateData= dao.getCurrentTemplateData(templateId);
		if (!_.isUndefined(currentTemplateData.data)) {
			for (rowId in currentTemplateData.data) {
				symbols[_.trim(currentTemplateData.data[rowId].symbol)] = {};
			}
		}
		//console.log(_.keys(symbols).sort());
	}
	
	return _.keys(symbols).sort();
}

/*
var getSymbols = function(data){
	var symbols = [];
	for (watcher in data) {
		symbols.push(data[watcher].symbol);
		
	}
	console.log(data);
	console.log(symbols);
	return symbols;
}
*/
exports.download = download;
exports.downloadAll = downloadAll;