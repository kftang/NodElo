//TODO: Better error checking (check if it already exists vs only seeing err no)
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var bodyParser = require('body-parser');
const fs = require('fs')

var crypt = require('./crypt')
var index = require('./routes/rankings');
var log = require('./routes/log');
var login = require('./routes/login');
var dashboard = require('./routes/dashboard');
var checkin = require('./routes/checkin');
var generator = require('./routes/generator');
var tournament = require('./routes/tournament');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  maxAge: 600000,
  resave: false,
  saveUninitialized: false,
  secret: 'pingpongrocks'
}));

app.use('/', index.router);
index.ranks.init();
app.use('/log', log);
app.use('/login', login);
app.use('/dashboard', dashboard);
app.use('/checkin', checkin);
app.use('/generator', generator);
app.use('/tournament', tournament);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
