
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var watcher = require('./routes/watcher');
var createTemplate = require('./routes/createTemplate');
var http = require('http');
var path = require('path');

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


watcher.setRESTInterfaces(app);
createTemplate.setRESTInterfaces(app);
//watcher.initialize();


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
