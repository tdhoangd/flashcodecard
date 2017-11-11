var express = require('express');
var router = express.Router();
var sqlite = require('sqlite3');

module.exports = {
	host     : 'localhost',
	user     : 'fcc_user',
	password : 'password',
	database : 'my_db'
}

module.exports = function(database) {
	database.serialize(function() {
		database.run('PRAGMA foreign_keys = ON');

		database.run(`
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
				name TEXT NOT NULL,
				password TEXT NOT NULL,
				UNIQUE(name)
			)
		`);
	
		database.run('', function(objectError) {
			console.log('created tables');
		});
	});
}

