var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserRawTemplateSchema = new Schema({
		templateId: String,
		name: String,
    table: [{
						header: {type:String,required:true},
						name: {type:String,required:true},
						formula:{type:String,required:false},
						order: {type:Number,required:true},
						source: {type:String,required:true},
						type: {type:String,required:false},
						size: {type:Number,required:true},
						align:{type:String,default:'L',required:false}
					}],
		userId: String,
		createdTime:{type: Date, default: Date.now },
		updatedTime:{type: Date, default: Date.now }
	})

exports.UserRawTemplate = mongoose.model('UserRawTemplate',UserRawTemplateSchema)