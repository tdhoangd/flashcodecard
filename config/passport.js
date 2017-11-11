
var strategy    = require('passport-local').Strategy;
var sqlite      = require('sqlite3');

module.exports = function(passport, database) {

    passport.use(new strategy(
        function(username, password, done) {

            database.all(`
                SELECT * FROM users WHERE name = :strName and password = :strPassword
            `, {
                ':strName': username,
                ':strPassword': password
            }, function(err, rows) {
                if (err) {
                    console.log('Fail Auth: (' + username + ', ' + password + ')');
                    return done(null, false);
                } 

                if (rows.length < 1) {
                    return done(null, false);
                }
                
                return done(null, rows[0].id) 
            });            
    })); 

    passport.serializeUser(function(user, done) {
        console.log('serializeUser: ' + user);
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        console.log('deserializeUser: ' + user);
        done(null, user);
    });

 

};



