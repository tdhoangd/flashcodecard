var express = require('express');
var router = express.Router();

module.exports = function(server, passport, database, renderFile) {

    // route middleware to check if user loged in
	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated())
			return next();

		renderFile(req, res, 'login.html', true, 'Please login first!');
	}
	
    /* MAIN PAGE */ 
	server.get('/main', isLoggedIn, function(req, res) {
		res.sendFile('main.html', {'root': __dirname + '/../views/'});
	}); // [ END /main ]

	
	/* CREATE NEW SET */
	server.post('/create-new-set', isLoggedIn, function(req, res) {
	
		var functionPreProcess = function() {
			if (!req.body.title) {
				functionError(req, res, 'Error: missing set title');
				return;
			} 

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
					console.log(err);
					functionError(req, res, '');
					return;
				}
				
				functionSendListSet(req, res);
				return;
			});	
		}
	
		functionPreProcess();

	}); // [ END /create-new-set]

	/* GET LIST SETS */
	server.get('/list', isLoggedIn, function(req, res) {
		functionSendListSet(req, res);
	}) // [ END /list]

	/* CREATE NEW FLASH CARD */
	server.post('/create-new-flashcard', isLoggedIn, function(req, res) {

		var functionPreProcess = function() {
			
			if (!req.body.strSetId || !req.body.htmlFrontcard || !req.body.htmlBackcard) {
				functionError(req, res, 'Error: Missing Information');
				return;
			}

			if (req.body.strSetId.length < 1) {
				functionError(req, res, 'Error: Invalid set');
				return;
			}

			// if a set belong to a user
			database.all(`
				SELECT sets.id FROM sets
				JOIN users on (users.id = sets.userid)
				WHERE users.name = :strName and sets.id = :strSetId
			`, {
				':strName': req.user.id,
				':strSetId': req.body.strSetId
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
					:htmlFrontcard, :htmlBackcard, :strSetId
				)
			`, {
				':htmlFrontcard': req.body.htmlFrontcard,
				':htmlBackcard': req.body.htmlBackcard,
				':strSetId': req.body.strSetId
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
		var strSetId = req.query.strSetId;

		if (!strSetId || strSetId.length < 1) {
			functionError(req, res, 'Error: set id not found or invalid set id');
			return; 
		}

		database.all(`
			SELECT flashcards.id, flashcards.frontcard, flashcards.backcard
			FROM flashcards
			JOIN sets ON (sets.id = flashcards.setid)
			JOIN users ON (users.id = sets.userid)
			WHERE sets.id = :strSetId and users.id = :strUserIdent
		`, {	
			':strSetId': strSetId,
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

	/* REMOVE a CARD */
	server.get('/removefc', isLoggedIn, function(req, res) {
		if (!req.query.strSetId || !req.query.strFcId ) {
			functionError(req, re, 'Error: setid and cardid not found');
			return; 
		}

		database.run(`
			DELETE FROM flashcards
			WHERE flashcards.id = :strFcId and flashcards.setid = :strSetId 
		`, {
			':strFcId': req.query.strFcId,
			':strSetId': req.query.strSetId
		}, function(err) {
			if (err) {
				functionError(req, res, 'Error: unable to get your request right now!');
				return; 
			}
			functionSuccess(req, res, 'Successful remove an entry!', 'text/plain');
		});
	}); 

	/* UPDATE FLASHCARD */
	server.post('/updatefc', isLoggedIn, function(req, res) {

		database.run(`
			UPDATE flashcards
			SET frontcard = :htmlFrontcard, 
				backcard = :htmlBackcard
			WHERE
				id = :strFcId 
		`, {
			':htmlFrontcard': req.body.htmlFrontcard,
			':htmlBackcard': req.body.htmlBackcard,
			':strFcId': req.body.strFcId
		}, function(err) {
			if (err) {
				console.log(err);
				functionError(req, res, 'Error: unable to get your request right now!');
				return; 	
			}
			
			functionSuccess(req, res, 'Successful update an entry!', 'text/plain');
		});
	});

	

	/** RES FUNCTIONS */
	function functionSendListSet(req, res) {
		database.all(`
			SELECT sets.id, sets.title, sets.discription  FROM sets
			JOIN users ON (sets.userid = users.id)
			WHERE users.id = :intUserIdent
		`, {
			':intUserIdent': req.user.id
		}, function(err, rows) {
			if (err !== null) {
				console.log(err);
				functionError(req, res, '');
				return;
			} 

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