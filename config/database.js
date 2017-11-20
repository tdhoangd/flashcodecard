var express = require('express');
var router = express.Router();
var sqlite = require('sqlite3');

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

		database.run(`
			CREATE TABLE IF NOT EXISTS sets (
				id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
				title TEXT NOT NULL,
				discription TEXT,
				userid, 
				FOREIGN KEY(userid) REFERENCES users(id)
			)
		`);

		database.run(`
			CREATE TABLE IF NOT EXISTS flashcards (
				id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
				frontcard TEXT NOT NULL,
				backcard TEXT,
				setid,
				FOREIGN KEY(setid) REFERENCES sets(id)
			)
		`);
	
		database.run('', function(objectError) {
			console.log('created tables');
		});
	});
}

