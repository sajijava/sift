
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