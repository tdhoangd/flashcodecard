var express = require('express');
var router = express.Router();

module.exports = function(server, passport, database, renderFile) {

    // route middleware to check if user loged in
	function isLoggedIn(req, res, next) {
		console.log(req.isAuthenticated());
		if (req.isAuthenticated())
			return next();

		renderFile(req, res, 'login.html', true, 'Please login first!');
	}
	
    /* MAIN PAGE */ 
	server.get('/main', isLoggedIn, function(req, res) {
		console.log(req.user);

		res.sendFile('main.html', {'root': __dirname + '/../views/'});
	}); // [ END /main ]

	
	/* CREATE NEW SET */
	server.post('/create-new-set', isLoggedIn, function(req, res) {
	
		var functionPreProcess = function() {
			if (!req.body.title) {
				console.log('wrong');
			} 
			console.log('---received---');
			console.log(req.body);
			console.log(req.body.title);
			console.log(req.body.discription);
			console.log(req.user.name);
			
			functionUpdateSetTable();
		}

		var functionUpdateSetTable = function() {
			
			database.run(`
				INSERT INTO sets (
					title, discription, userid
				) VALUES (
					:strTitle, :strDiscription, (
						SELECT id FROM users WHERE name = :strUsername
					)
				)
			`, {
				':strTitle': req.body.title,
				':strDiscription': req.body.discription,
				':strUsername': req.user.name
			}, function(err) {
				if (err) {
					console.log('--- Error when insert new set');
					console.log(err);
					functionError('Unable to register. Please try again with other username and password!');
					return;
				}
				
				functionPreSuccess();
			});
			
		
		}
	
		// get list of sets from database
		var functionPreSuccess = function () {
			
			// get list of set 
			database.all(`
				SELECT title, discription  FROM sets
				JOIN users ON (sets.userid = users.id)
				WHERE users.id = :intUserIdent
			`, {
				':intUserIdent': req.user.id
			}, function(err, rows) {
				if (err !== null) {
					console.log('--- Error when get sets');
					console.log(err);
					functionError('Unable to handle request right now!');
				} 
				
				console.log(rows);
				functionSuccess(JSON.stringify(rows, null, 4));
			});
			
			
			res.status = 200;		
		}

		var functionSuccess = function(strRows) {
			res.status = 200;
			res.end(strRows);
		}

		var functionError = function(strMsg) {
			res.status = 500;
			res.send({'error': strMsg });
		}

		functionPreProcess();

	}); // [ END /create-new-set]

	/* GET LIST SETS */
	server.get('/list', isLoggedIn, function(req, res) {
		functionSendList(req, res);
	}) // [ END /list]


	/** RES FUNCTIONS */
	function functionSendList(req, res) {
		database.all(`
			SELECT sets.id, sets.title, sets.discription  FROM sets
			JOIN users ON (sets.userid = users.id)
			WHERE users.id = :intUserIdent
		`, {
			':intUserIdent': req.user.id
		}, function(err, rows) {
			if (err !== null) {
				console.log('--- Error when get sets');
				console.log(err);
				functionError();
				return;
			} 

			console.log(rows);
			functionSuccess(req, res, JSON.stringify(rows, null, 4), 'application/json');
		});
	}

	function functionError(req, res) {
		res.status = 404; 
		res.end('Not Found');
	}

	function functionSuccess(req, res, strData, contentType) {
		res.status = 200;
		res.set({ 'Content-Type': contentType});
		res.end(strData);
	}

}    