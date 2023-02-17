var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// support to call database
require('dotenv').config();
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Customer Pages
var loginRouter = require('./routes/login');
var landingRouter = require('./routes/landingPage');
var transactionHistoryRouter = require('./routes/transactionHistory');
var transferRouter = require('./routes/transfer');


// Employee Pages
var transactRouter = require('./routes/transactPage');


// Admin Pages
var registerRouter = require('./routes/register');
var passwordRouter = require('./routes/changePassword');
var manageRouter = require('./routes/manage');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Crypto
app.use(express.static(path.join(__dirname, "node_modules/crypto-js/")));

// Bootstrap
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist/')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap-icons/')));


// This will set up the database if it doesn't already exist
var dbCon = require('./lib/database');

// Session management to store cookies in a MySQL server (this has a bug, so we assist it by creating the database for it)
var dbSessionPool = require('./lib/sessionPool.js');
var sessionStore = new MySQLStore({}, dbSessionPool);
// Necessary middleware to store session cookies in MySQL
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret1234',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  cookie : {
    sameSite: 'strict'
  }
}));

// Middleware to make session variables available in .ejs template files
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});


// Index pages
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Customer Pages
app.use('/login', loginRouter);
app.use('/landingPage', landingRouter);
app.use('/transactionHistory', transactionHistoryRouter);
app.use('/transfer', transferRouter);

// Employee Pages
app.use('/transact', transactRouter);

// Admin Pages
app.use('/register', registerRouter);
app.use('/changePassword', passwordRouter);
app.use('/managePermissions', manageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
