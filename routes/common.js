var dao = require('./watcherDAO');
var findataDAO = require('./findataDAO');
var _ = require('lodash');
var Promise = require('bluebird');
var enums = require('./Enums');
var fieldSrc = require('./fieldSource');


var fetchQuote = function(dataObject){

		console.log("GetData from Yahoo..."+dataObject.symbols);

		return dao.getCurrentTemplate(dataObject.id)
							.then(function(template){
								
								//console.log(template[0]);
								var src = _.keys(template.sourceFlds)
								dataObject['currTemplate'] = template;
						
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
			//console.log(finAttributes);
			
			
			
			findataDAO.getFinStatment(_.keys(dataObject.quoteData))
			.then(function(finStmts){
					finStmts.forEach(function(finStmt){
						//console.log(finStmt.companyname+','+finStmt.symbol)
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

exports.fetchQuote = fetchQuote;
exports.fetchFinancials = fetchFinancials;

var fs = require("fs"), json;

var readJsonFileSync = function(filepath, encoding){
    if (typeof (encoding) == 'undefined'){
        encoding = 'utf8';
    }
    fs.exists(filepath,function(exist){
        if (!exist) {
						console.log("File Does not exit. Create it")
            fs.writeFile(filepath,'');
        }
    })
    var file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
}
exports.writeJsonFile = function(file, data) {
    var filepath = __dirname + '/json/' + file;
    console.log(filepath+" "+data);
    fs.writeFileSync(filepath, JSON.stringify(data,null,1),'utf8',function(err){
            if (err) {
                console.log(err);
            }
        });
}
var getConfig = function(file){
    var filepath = __dirname + '/json/' + file;
    console.log("read file "+filepath)
    return readJsonFileSync(filepath);
}

exports.readAll = function(filename)
{
		return getAllWithDefault(filename,[])
}
 
var getAllWithDefault = function(filename, defaultType)
{
	  var all = defaultType;
    try {
				console.log("read file "+filename);
        all = getConfig(filename);
			//	console.log("data "+JSON.stringify(all));
    } catch(e) {
        console.log("error"+e);
        
    }
		
    if (typeof all == undefined) {
        all = defaultType;
    }
    return all;
}
exports.createIfNotFileExist = function(fileName, callbkFn){
		var filepath = __dirname + '/json/' + fileName
		fs.exists(filepath,function(exist){
        if (!exist) {
						callbkFn();
        }else{
						console.log(filepath+" already exist..")
				}
    })
}
exports.getFileName = function(filename){
        return filename + ".json";
}
exports.trim = function (str) {
        return str.replace(/^\s+|\s+$/g,"");
  }
	
exports.isUndefined = function(obj){
		return (typeof obj === 'undefined');
}
exports.getAllWithDefault = getAllWithDefault;
