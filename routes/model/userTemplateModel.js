var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.promise = require('bluebird')
mongoose.set('debug',true)

var UserTemplateSchema = new Schema({
		templateId: String,
    name: String,
    template: [{
						header: {type:String,required:true},
						name: {type:String,required:true},
						formula:{type:String,required:false},
						order: {type:Number,required:true},
						source: {type:String,required:true},
						type: {type:String,required:false},
						size: {type:Number,required:true},
						align:{type:String,default:'L',required:false}
    }],
    formatting: Schema.Types.Mixed,
    header: [{
        name: {type:String,required:true},
        field: {type:String,required:true},
        cellFilter: {type:String,required:true},
        width: {type:Number,required:true}
      }],
    sourceFlds: Schema.Types.Mixed,
		userId: String,
		createdTime:{type: Date, default: Date.now },
		updatedTime:{type: Date, default: Date.now }

	})

UserTemplateSchema.statics.getAllTemplates = function(){	
	return this.find({},{"templateId":1,"name":1,"_id":0}).exec();
}

UserTemplateSchema.statics.getOneTemplate = function(templateId){
		return this.findOne({"templateId":templateId}).exec()
		
}




module.exports = mongoose.model('UserTemplate',UserTemplateSchema,'UserTemplate');