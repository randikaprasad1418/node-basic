var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var session = require('express-session');
var appConfig = require('config').application;

// Connect to the MongoDB
mongoose.connect('mongodb://'+
appConfig.DATABASE_HOST+':'+
appConfig.DATABASE_PORT+'/'+
appConfig.DATABASE_NAME);

var app = express();
// Use express session support since OAuth2orize requires it
app.use(session({
    secret: '_schoolappsecrutshouldinludhere_',
    saveUninitialized: true,
    resave: true
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Use the passport package in our application
app.use(passport.initialize());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(bodyParser({ 
    limit: 1024 * 1000 * 1024
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: 1024 * 1000 * 1024, extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var router = express.Router();
// app.param('id', (req, res, next, value) => {
//     req.params.id = value;
//     next();
// });
require('./routes')(router);
app.use('/api/v1', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});

// Use environment defined port or 3000
var port = process.env.PORT || appConfig.PORT;
// Start the server
app.listen(port, appConfig.HOST, function () {
    console.log('Server started on ' + port);
});