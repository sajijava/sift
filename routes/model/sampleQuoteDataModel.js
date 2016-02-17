var mongoose = require('mongoose');
var schema = mongoose.Schema;

var SampleQuoteDataModel = new Schema({},{'strict':false})

exports.SampleQuoteDataModel = SampleQuoteDataModel;