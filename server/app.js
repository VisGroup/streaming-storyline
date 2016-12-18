var os = require("os");
var platform = os.platform();
var express = require('express');
var http = require('http');
var https = require('https');
var request = require('request');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
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

app.get('/', function(req, res) {
    handle(webpage, req, res);
});

app.post('/demo', function(req, res) {
    handle(postDemo, req, res);
});

app.get('/msg', function(req, res) {
    handle(getMsg, req, res);
});

function postDemo(req, res) {
    var time = (new Date()).toLocaleString();
    console.log(time, req.ip, req.header('host'), req.query);

    var cmd = ['demo.exe', 'arg1', 'arg2'].join(' ');

    if (false /*something here*/ ) {
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

function getMsg(req, res) {
    console.log("get msg");
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    });
    console.log(23333);

    var data_all = parseTxtData('movie_data/StarWars_interaction_sessions.txt');

    var time = 0;

    var child_executable = platform == "win32" ? "StreamingStoryline.exe" : "gintama";
    var child = spawn('storyline-layout/' + child_executable);
    child.stdout.on('data', function(data) {
        console.log(data.toString());
        res.write("data:" + data.toString() + "\n\n");
    });

    var timer = setInterval(function() {
        var str = time + '\t';
        var len = data_all.events[time].length;
        for (var j = 0; j < len; j++) {
            str += JSON.stringify(data_all.sessions[data_all.events[time][j]].members).split(/[\[\]]/)[1];
            str += '\t';
        }
        child.stdin.write(str + '\n');
        console.log(str);
        time++;

        //if (time > 5) {
        //    clearInterval(timer);
        //    return;
        //}

        if (data_all.events[time] == undefined) {
            child.stdin.write('#\n');
            child.stdin.end();
            res.write("data:over\n\n");
            console.log("finish");
            clearInterval(timer);
        }
    }, 1000);
}

function webpage(req, res) {
    res.render('StreamingStoryline');
}

function parseTxtData(filename) {
    var data = fs.readFileSync(filename).toString().split('\n');
    var len = data.length;
    var time_count = parseInt(data[0].split('=')[1]);
    var names = JSON.parse(data[5].split("'").join('"'));
    var result = {
        time_count: time_count,
        names: names,
        sessions: [],
        events: []
    };
    for (var i = 7; i < len; i++) {
        var s = data[i];
        if (s.indexOf('Id') >= 0) {
            result.sessions.push({
                id: parseInt(s.split(':')[1]),
                start: -1,
                end: -1,
                members: null
            });
        }
        if (s.indexOf('Start') >= 0) {
            result.sessions[result.sessions.length - 1].start = parseInt(s.split(':')[1]);
        }
        if (s.indexOf('End') >= 0) {
            result.sessions[result.sessions.length - 1].end = parseInt(s.split(':')[1]);
        }
        if (s.indexOf('Members') >= 0) {
            result.sessions[result.sessions.length - 1].members = JSON.parse(s.split(':')[1]);
        }
    }
    var len = result.sessions.length;
    for (var i = 0; i < time_count; i++) {
        result.events.push([]);
        for (var j = 0; j < len; j++) {
            if (i >= result.sessions[j].start && i <= result.sessions[j].end) {
                result.events[i].push(j);
            }
        }
    }
    return result;
}

// console.log(JSON.stringify(parseTxtData('movie_data/StarWars_interaction_sessions.txt')));
