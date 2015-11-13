// Use the OAuth module
var oauth = require('oauth');

// Setup key/secret for authentication and API endpoint URL
var configuration = {
  api_url: "https://api.tradeking.com/v1",
  consumer_key: "DJOSGj44FTCBqfVznFXkkk3UiJGB43nmoHrJ6XHx",
  consumer_secret: "krgbfkezq7mx6Jw7jVaytMoa07RXVbtoowGj8YHB",
  access_token: "dJx3amo15p2mdePHVR8bKHfqr39A772Zt5R4rkqM",
  access_secret: "JnAwXqZOCOkyrwwZVYJmFVQxRohjZnUNgREsPczW"
}

// Setup the OAuth Consumer
var tradeking_consumer = new oauth.OAuth(
  "https://developers.tradeking.com/oauth/request_token",
  "https://developers.tradeking.com/oauth/access_token",
  configuration.consumer_key,
  configuration.consumer_secret,
  "1.0",
  "", //callback url
  "HMAC-SHA1");

var option_strike_suff_url = "/market/options/strikes.json?symbol=";
var option_expiration_suff_url = "/market/options/expirations.json?symbol=";
var option_quote_suff_url ="/market/ext/quotes.json?symbols=";
var option_search_suff_url = "/market/options/search.json?symbol=";

function getData(url, res) {
  console.log(url);
  
  tradeking_consumer.get(url,configuration.access_token, configuration.access_secret,
                         function(error, data, response){
													console.log("in getData "+data)
													if (typeof data != 'undefined' && trim(data).length > 0 ) {
														account_data = JSON.parse(data);
														console.log("error :"+error)
														res.json(account_data.response);
													}
    });
}
var getStrike = function(symbol, res){
  symbol = symbol.toUpperCase();
	getData(configuration.api_url+option_strike_suff_url+symbol,res);
}


var getQuote = function(symbol, flds, f){
  var fields= (typeof flds != undefined  && flds.length > 0)?"&fids="+flds:"";
  symbol = symbol.toUpperCase();
  var url = configuration.api_url+option_quote_suff_url+symbol+fields;
  console.log(url);
  return tradeking_consumer.get(url,configuration.access_token, configuration.access_secret,
                         function(error, data, response){
//console.log(data);
    //console.log(response);
		try{
			if (typeof data != 'undefined') {
				account_data = JSON.parse(data);
				console.log("error :"+error)
				console.log(account_data.response);
				f(account_data.response.quotes.quote);
			}
		}catch(err)
		{
			console.error(err)
		}
  });
}

var getExperation = function(symbol,res){
  symbol = symbol.toUpperCase();
	getData(configuration.api_url+option_expiration_suff_url+symbol,res);
  
}
var findOptionChain = function(symbol,query,counter, returnData){
  
  var fields= "";//"&fids=strikeprice,put_call,xmonth,xyear,bid,ask,vl,openinterest";
  //symbol,query, counter,
  var optionChain = [];
  var url = configuration.api_url+option_search_suff_url+symbol+query+fields;
  console.log(url);
   tradeking_consumer.get(url,configuration.access_token, configuration.access_secret,
                         function(error, data, response){
    account_data = JSON.parse(data);
    //console.log("error :"+error)
   // console.log(account_data.response.quotes.quote);
    
    var data = account_data.response.quotes.quote;
      
    var call_put = {};
    
    data.sort(function(a,b){
            var aStrike = +a.strikeprice;
	    var bStrike = +b.strikeprice;
	    if (aStrike > bStrike) {
              return 1;
	    }else if (aStrike < bStrike) {
	      return -1;
            }else{
              return (a.put_call > b.put_call)
            }
	});
    
    var callData = data.filter(function(d){return d.put_call == 'call'})
    var putData = data.filter(function(d){return d.put_call == 'put'})

    call_put = {"call":callData,"put":putData};
    counter.dec();
    console.log(counter);
    returnData.push(call_put);
    //res.json(call_put);
    
  });
}

var getCallPremium = function(symbol, expire, strike,fields, fn){
	symbol = symbol.toUpperCase();
	var optionSym = optionSymbol(symbol,expire, strike,'C');
	console.log("call premium "+optionSym)
	getQuote(optionSym,fields,function(d){
				//console.log(d);
				fn(d);
    });
}
var getPutPremium = function(symbol, expire, strike,fields, fn){
	symbol = symbol.toUpperCase();
	var optionSym = optionSymbol(symbol,expire, strike,'P');
	console.log("put premium "+optionSym)
	getQuote(optionSym,fields,function(d){
				//console.log(d);
				fn(d);
    });
}

var optionSymbol = function(sym,exp,strk, dir)
{
    var strikeMask = "00000";
    var strike = ""+(strk * 1000);
    var expire = new Date(exp.replace(/-/g, "/"));
		console.log(exp+" "+expire)
    return sym+getDateAsLong(expire)
							+dir+strikeMask.substring(0,8 - strike.length)+strike
}

var getDateAsLong = function(dt){
	return ""+(dt.getYear()-100)
					 +(dt.getMonth() < 9?'0'+(dt.getMonth()+1):dt.getMonth()+1)
					 +(dt.getDate() < 9?'0'+dt.getDate():dt.getDate())
}
var trim = function (str) {
        return str.replace(/^\s+|\s+$/g,"");
}

exports.trim = trim;
exports.getQuote = getQuote;
exports.getDateAsLong = getDateAsLong;
exports.makeSymbol = optionSymbol


exports.setRESTInterfaces = function(app){
	app.get('/api/tk/getStrike', function(req, res){
	  getStrike(req.query.symbol,res);
	});
	app.get('/api/tk/getExperation', function(req, res){
		getExperation(req.query.symbol,res);
	});
	app.get('/api/tk/getLastQuote', function(req, res){
		getQuote(req.query.symbol,'last,name,chg_sign,chg,op_flag',function(d){
			res.json(d)
			});
	});
	app.get('/api/tk/getQuote', function(req, res){
		getQuote(req.query.symbol,'ask,pcls,idelta,imp_volatility,igamma,opt_val',function(d){
			res.json(d)
			});
	});
	app.get('/api/tk/getCallPremium/:symbol/:strike/:expire',function(req, res){
			var sym = req.params.symbol
			var stk = req.params.strike
			var exp = req.params.expire

		getCallPremium(sym, exp, stk,'ask,pcls,idelta,imp_volatility,igamma,opt_val',function(d){
			res.json({"today":d.last,"yday":d.pcls,"delta":d.idelta,"iv":d.imp_volatility,"gamma":d.igamma,"val":d.opt_val});
			})
		})
}