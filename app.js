
/**
 * Module dependencies.
 */

var express = require('express');
var lessMiddleware = require('less-middleware');
var mongoose = require('mongoose')
var http = require('http');
var path = require('path');


var routes = require('./routes');
var user = require('./routes/user');
var watcher = require('./routes/watcher');
var createTemplate = require('./routes/createTemplate');
var enums = require('./routes/Enums');
var downloadStmts = require('./routes/downloadStatements');
var dbView = require('./routes/dbview');


mongoose.set('debug',true)


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use('/',express.static(path.join(__dirname, 'public')));
app.use('/node',express.static(path.join(__dirname, 'node_modules')));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
    res.redirect("/index.html")
    }
  );


app.configure(function(){
  //other configuration here...
  app.use(lessMiddleware({
    src      : __dirname + "/public/stylesheets",
    dest     : __dirname + "/public/stylesheets",
    debug:true,
    force:true,
    compress : false
  }));
  app.use(express.static(__dirname + '/public/stylesheets'));
});


mongoose.connect(enums.dbconnectURL);

watcher.setRESTInterfaces(app);
createTemplate.setRESTInterfaces(app);
dbView.setRESTInterfaces(app);

//watcher.initialize();
//downloadStmts.downloadAll();

//downloadStmts.downloadFromList(enums.sampleSymbols);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
