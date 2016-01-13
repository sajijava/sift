
var url = require('url');
var request = require('request');
var Promise = require('bluebird');

var DEV_APP_KEY = 'tnn7r9qruqrm226cu4s7zteb';
var EDGAR_ONLINE_URL = 'http://edgaronline.api.mashery.com/v2/corefinancials/';
var QUARTER = 'qtr';
var ANNUAL = 'ann';

request = Promise.promisifyAll(request);

var getQuarterData = function(symbol, period){
	return getFinancialData(QUARTER,symbol,period);
}

var getQuarterData3Month = function(symbol){
	return getQuarterData(symbol,3);
}

var getAnnualData = function(symbol, period){
	return getFinancialData(ANNUAL,symbol,period);
}

var getAnnualData3Month = function(symbol){
	return getAnnualData(symbol,3);
}

var getFinancialData = function(type,symbol,period){
	
	return download(EDGAR_ONLINE_URL+type, {
        primarysymbols:symbol,
				numperiods:period,
				appkey:DEV_APP_KEY
      })
	
}

var download = function(uri, qs) {
 // debug(url.format({pathname: uri, query: qs}));
	return request.getAsync({
    uri: uri,
    qs: qs
  }).spread(function (res, body) {
    if (res.statusCode === 200) {
      return body;
    } else {
      throw new Error(util.format('status %d', res.statusCode));
    }
  });
}

exports.getQuarterData = getQuarterData;
exports.getQuarterData3Month = getQuarterData3Month;
exports.getAnnualData = getAnnualData;
exports.getAnnualData3Month = getAnnualData3Month;
