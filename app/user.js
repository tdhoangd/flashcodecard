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
					functionError(req, res, '');
					return;
				}
				
				functionSendList(req, res);
				return;
			});	
		}
	
		functionPreProcess();

	}); // [ END /create-new-set]

	/* GET LIST SETS */
	server.get('/list', isLoggedIn, function(req, res) {
		functionSendList(req, res);
	}) // [ END /list]

	/* CREATE NEW FLASH CARD */
	server.post('/create-new-flashcard', isLoggedIn, function(req, res) {

		var functionPreProcess = function() {
			
			if (!req.body.strSetID || !req.body.htmlFrontcard || !req.body.htmlBackcard) {
				functionError(req, res, 'Error: Missing Information');
				return;
			}

			if (!req.body.strSetID.startsWith('set') || req.body.strSetID.length < 4) {
				functionError(req, res, 'Error: Invalid set');
				return;
			}

			// if a set belong to a user
			database.all(`
				SELECT sets.id FROM sets
				JOIN users on (users.id = sets.userid)
				WHERE users.name = :strName and sets.id = :strSetID
			`, {
				':strName': req.user.id,
				':strSetID': req.body.strSetID.substr(3)
			}, function (err, rows) {
				if (err) {
					console.log(err);
					functionError(req, res, 'Error: bad request');
					return;
				}
				functionInsertCardtoDB();
			});

		}

		var functionInsertCardtoDB = function() {
			database.run(`
				INSERT INTO flashcards (
					frontcard, backcard, setid
				) VALUES (
					:htmlFrontcard, :htmlBackcard, :strSetID
				)
			`, {
				':htmlFrontcard': req.body.htmlFrontcard,
				':htmlBackcard': req.body.htmlBackcard,
				':strSetID': req.body.strSetID.substr(3)
			}, function (err) {
				if (err) {
					console.log(err);
					functionError(req, res, 'Error: bad request');
					return;
				}

				functionSuccess(req, res, 'Added new card successful', 'text/plain');
				return;
			});
		}

		functionPreProcess();
	}); // [ END /create-new-flashcard]

	/* GET FLASHCARD of a SET */
	server.get('/viewset', isLoggedIn, function(req, res) {
		var strSetID = req.query.strSetID;

		if (!strSetID || strSetID.length < 4) {
			functionError(req, res, 'Error: set id not found or invalid set id');
			return; 
		}

		strSetID = strSetID.substr(3);

		database.all(`
			SELECT flashcards.id, flashcards.frontcard, flashcards.backcard
			FROM flashcards
			JOIN sets ON (sets.id = flashcards.setid)
			JOIN users ON (users.id = sets.userid)
			WHERE sets.id = :strSetID and users.id = :strUserIdent
		`, {	
			':strSetID': strSetID,
			':strUserIdent': req.user.id
		}, function (err, rows) {
			if (err) {
				console.log(err);
				functionError(req, res, 'Error: unable to get your request right now!');
				return; 							
			}
			functionSuccess(req, res, JSON.stringify(rows, null, 4), 'application/json');	
		});

	}); // [ END /viewset]

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
				functionError(req, res, '');
				return;
			} 

			console.log(rows);
			functionSuccess(req, res, JSON.stringify(rows, null, 4), 'application/json');
		});
	}

	function functionError(req, res, strMsg) {
		res.status(400).send(strMsg);		
	}

	function functionSuccess(req, res, strData, contentType) {
		res.status = 200;
		res.set({ 'Content-Type': contentType});
		res.end(strData);
	}

}    