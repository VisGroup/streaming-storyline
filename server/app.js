var express = require('express');
var http = require('http');
var https = require('https');
var request = require('request');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var exec = require('child_process').exec;

var app = express();

//app.all('*', function(req, res, next) {
//    next();
//});
app.use(bodyParser.urlencoded({
    extended: false //,
        // limit: '50mb'
}));
app.use(bodyParser.json());
app.use(express.static('public'));

var app_port = 23333;
http.createServer(app).listen(app_port, function() {
    console.log('Http server listening on port ' + app_port);
});

app.set('view engine', 'ejs');

app.use(function(req, res, next) {
    if (req.is('text/*')) {
        req.text = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk) {
            req.text += chunk
        });
        req.on('end', next);
    } else {
        next();
    }
});

function handle(foo, req, res) {
    try {
        //         console.log(req.ip);
        foo(req, res);
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}

app.post('/demo', function(req, res) {
    handle(postDemo, req, res);
});

function postDemo(req, res) {
    var time = (new Date()).toLocaleString();
    console.log(time, req.ip, req.header('host'), req.query);

    var cmd = ['demo.exe', 'arg1', 'arg2'].join(' ');

    if (false/*something here*/) {
        res.send('error');
        return;
    }
    exec(cmd, function(err, stdout, stderr) {
        if (err) {
            res.send('error');
        } else {
            var data = stdout;
            console.log(data); // debug only, if slow, comment it
            res.send(stdout);
        }
    });
}
