var express = require('express');
var router 	= express.Router();
var fs = require('fs');
var mustache = require('mustache');

// send file normally (without error div) with flag = false; 
// when flag = true; send html with error msg div
module.exports = function(req, res, file, flag, strMsg) {
    fs.readFile(__dirname + '/../views/' + file, function(err, data) {
        if (err) {
            res.sendFile('index.html', {'root': __dirname + '/../views/'});
            return;
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
