var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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


// Bootstrap
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist/')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap-icons/')));

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


console.log("Running at: http://localhost:3000/");
module.exports = app;
