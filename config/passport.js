var strategy = require('passport-local').Strategy;
var sqlite  = require('sqlite3');
var bcrypt 	= require('bcryptjs');


module.exports = function (passport, database) {

    passport.use(new strategy(
        function (username, password, done) {

            database.all(`
                SELECT * FROM users WHERE name = :strName 
            `, {
                    ':strName': username
            }, function (err, rows) {
                if (err) {
                    console.log('Fail Auth: (' + username + ', ' + password + ')');
                    return done(null, false);
                }

                if (rows.length < 1) {
                    return done(null, false);
                }

                var objUser = {
                    'id': rows[0].id,
                    'name': rows[0].name
                };

                var hash = rows[0].password; 

                // compare passwords
                bcrypt.compare(password, hash).then((res) => {
                    if (res) {
                        return done(null, objUser);
                    } else {
                        return done(null, false);
                    }
                });
                
                // return done(null, objUser);
            });
      
    }));

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

};