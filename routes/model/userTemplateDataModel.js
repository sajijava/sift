var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.promise = require('bluebird')
mongoose.set('debug',true)


var UserTemplateDataSchema = new Schema({
		templateId: String,
    userId: String,
    data: [Schema.Types.Mixed],
		createdTime:{type: Date, default: Date.now },
		updatedTime:{type: Date, default: Date.now }

	})

UserTemplateDataSchema.statics.getDataForTemplate = function(templateId){
		return this.findOne({'templateId':templateId}).sort({'data.symbol':'asc'}).exec();
}

UserTemplateDataSchema.statics.getSymbolsForTemplate = function(templateId){
		return this.findOne({'templateId':templateId})
								.select({'data.symbol':1, _id:0}).exec();
}

UserTemplateDataSchema.methods.addNewSymbols = function(symbolList){
		symbolList.forEach(function(d){
												console.log("add" +JSON.stringify(d));
												console.log(this);
				try{
						this.data.push(d);
				}catch(e){
						console.log(e);
				}
						console.log("added" +this.data);
				});
}


module.exports = mongoose.model('UserTemplateData',UserTemplateDataSchema,'UserTemplateData');