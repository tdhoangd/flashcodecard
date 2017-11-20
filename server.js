'use strict';

// ---- get required packages
var express 	= require('express');
var server 		= express();
var morgan		= require('morgan');
var port 		= process.env.PORT || '8080'; 
var passport 	= require('passport');
var session 	= require('express-session');
var sqlite	= require('sqlite3');
var path		= require('path');

var bodyParser 		= require('body-parser');
var cookieParser 	= require('cookie-parser');
 
// set up log, parse cookie, html form, 
server.use(morgan('dev'));
server.use(bodyParser.urlencoded({ extended: true }));;
server.use(cookieParser());
server.use(bodyParser.json());


// config
var database = new sqlite.Database(__dirname + '/config/database.sqlite');
require('./config/database.js')(database);
server.use(session({
	secret: 'cat in the hat',
	resave: false,
	saveUninitialized: false
}));
require('./config/passport.js')(passport, database);
server.use(passport.initialize());
server.use(passport.session());

// ---- routes ------ //
var renderFile = require('./app/renderFile.js');
require('./app/routes.js')(server, passport, database, renderFile);
require('./app/user.js')(server, passport, database, renderFile);

/* UNKNOWN ROUTES */
server.get('*', function(req, res) {
	res.redirect('/');
});


/* ----------------------------------------------------- */ 
/* -----------  Start server --------------------------- */
server.listen(port);
console.log('Server listen on port ' + port);










