var express = require('express');
var router 	= express.Router();
var path 	= require('path');
var sqlite 	= require('sqlite3');
var bcrypt 		= require('bcryptjs');

// route to login, logout, register, public files, 
module.exports = function(server, passport, database, renderFile) {

	// serve static public files like css, image, 
	// and client side javacript files 
	server.use(express.static(path.join(__dirname, '/../public/')));

	/* HOME */
	server.get('/', function(req, res) {
		// res.sendFile('index.html', {'root': __dirname + '/../views/'});
		renderFile(req, res, 'index.html', false, null);
	});

	/* REGISTER */
	server.get('/register', function(req, res) {
		renderFile(req, res, 'register.html', false, null);
		// res.sendFile('register.html', {'root': __dirname + '/../views/'});
	});

	/* LOGIN */
	server.get('/login', function(req, res) {
		// res.sendFile('login.html', {'root': __dirname + '/../views/'});
		if (req.isAuthenticated()) {
			res.redirect('/main');
		} else {
			renderFile(req, res, 'login.html', false, null);
		}
	});	

	/* LOGOUT */
	server.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	/* POST LOGIN */ 
	server.post('/login', passport.authenticate('local', {
		successRedirect: '/main',
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
			
			// generate hash string from user input password
			bcrypt.hash(req.body.password, 10, function(err, hash) {
				if (err) {
					console.log(err);
					functionError('Unable to register. Please try again with other username and password!');
				} 

				functionDatabaseInsert(hash);				
			});


		}

		var functionDatabaseInsert = function(hash) {
			
			database.run(`
				INSERT INTO users (
					name, password
				) VALUES (
					:strName, :strPassword
				)
			`, {
				':strName': req.body.username,
				':strPassword': hash
			},function(err) {
				if (err) {
					console.log(err);
					functionError('Unable to register. Please try again with other username and password!');
					return;
				}		
				var objUser = { 'id': this.lastID, 'name': req.body.username};
				console.log('New user: ' +  objUser.toString());
				
				functionPreSuccess(objUser);
			});
			return;
		}

		var functionPreSuccess = function(objUser) {
			database.run(`
				INSERT INTO sets (
					title, discription, userid
				) VALUES (
					:strTitle, :strDiscription, :intUserID
				)
			`, {
				':strTitle': 'default',
				':strDiscription': 'default set',
				':intUserID': objUser.id
			}, function(err) {
				if (err) {
					console.log(err);
					throw err; 
				}

				functionSuccess(objUser);
			});
		}

		var functionError = function(strMsg) {
			renderFile(req, res, 'register.html', true, strMsg);
			return;
		}

		var functionSuccess = function(user) {			
			req.login(user, function(err) {
				// send to home page on error
				if (err) {
					console.log(err);
					// res.sendFile('index.html', {'root': __dirname + '/../views/'});
					renderFile(req, res, 'index.html', false, null);
				}
				return res.redirect('/main');
			});
			return;
		}
		
		functionPreprocess();
	}); // [ END POST REGISTER]

}

