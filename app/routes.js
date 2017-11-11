var express = require('express');
var router 	= express.Router();
var path 	= require('path');
var sqlite 	= require('sqlite3');
var fs = require('fs');
var mustache = require('mustache');

module.exports = function(server, passport, database) {

	// serve static public files like css, image, 
	// and client side javacript files 
	server.use(express.static(path.join(__dirname, 'public/')));

	/* HOME */
	server.get('/', function(req, res) {
		res.sendFile('index.html', {'root': __dirname + '/../views/'});
	});

	/* REGISTER */
	server.get('/register', function(req, res) {
		sendRenderFile(req, res, 'register.html', false, null);
		// res.sendFile('register.html', {'root': __dirname + '/../views/'});
	});

	/* LOGIN */
	server.get('/login', function(req, res) {
		// res.sendFile('login.html', {'root': __dirname + '/../views/'});
		sendRenderFile(req, res, 'login.html', false, null);
	});	

	/* PROFILE  */
	server.get('/profile', isLogedIn, function(req, res) {
		res.sendFile('profile.html', {'root': __dirname + '/../views/'});
	});

	/* LOGOUT */
	server.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	/* POST LOGIN */ 
	server.post('/login', passport.authenticate('local', {
		successRedirect: '/profile',
		failureRedirect: '/login'
	}));


	/* POST REGISTER */
	server.post('/register', function(req, res) {
		console.log('Register: \n username: ' + req.body.username);
		console.log('password: ' + req.body.password);

		var functionPreprocess = function() {
			if (req.body.username === undefined || req.body.password === undefined) {
				functionError("Error");
				return;
			} 

			if (req.body.username.length < 5 || req.body.password.length < 5 ||
				req.body.username.length > 31 || req.body.password.length > 31) {
				functionError('username and password should have length between 5 and 30');
				return;
			} 
			
			functionDatabaseInsert();
		}

		var functionDatabaseInsert = function() {
			database.run(`
				INSERT INTO users (
					name, password
				) VALUES (
					:strName, :strPassword
				)
			`, {
				':strName': req.body.username,
				':strPassword': req.body.password
			},function(err) {
				if (err) {
					console.log(err);
					functionError('Unable to register. Please try again with other username and password!');
					return;
				}
				console.log(this.lastID);
				functionSuccess(this.lastID);
			});
			return;
		}

		var functionError = function(strMsg) {
			sendRenderFile(req, res, 'register.html', true, strMsg);
			return;
		}

		var functionSuccess = function(id) {
			req.login(id, function(err) {
				// send to home page on error
				if (err) {
					console.log(err);
					res.sendFile('index.html', {'root': __dirname + '/../views/'});
				}
				return res.redirect('/profile');
			});
			return;
		}
		
		functionPreprocess();
	});

	// set file normally with flag = false; 
	// when flag = true; send html with error msg div
	function sendRenderFile(req, res, file, flag, strMsg) {
		fs.readFile(__dirname + '/../views/' + file, function(err, data) {
			if (err) {
				res.sendFile('index.html', {'root': __dirname + '/../views/'});
			}
			res.status(200);
			res.set({'Content-Type': 'text/html'}); 

			res.write(mustache.render(data.toString(), {
				'flag': flag,
				'strMsg': strMsg
			}));
			res.end();
		});
	}

	// route middleware to check if user loged in
	function isLogedIn(req, res, next) {
		console.log(req.isAuthenticated());
		if (req.isAuthenticated())
			return next();

		sendRenderFile(req, res, 'login.html', true, 'Please login first!');
	}

}

