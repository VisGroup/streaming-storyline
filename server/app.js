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

var http = require("http");
var querystring = require('querystring');

function submit_post_request (options, request, callback) {
    var req = http.request(options, function(res) {
        //console.log('Status: ' + res.statusCode);
        //console.log('Headers: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (body) {
            console.log('Body: ' + body);
            // eliminate return carriages
            callback(body.replace(/\n+/, ''));
        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    // write data to request body
    var param = querystring.stringify({
        "data": "hahaha"
    });
//    var r;
//    eval("r= + request);

    req.write(param);
    req.end();
}

function submit_get_request (url, para, callback) {
    var handler = function(response) {
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            callback(str);
        });
    };

    var u = url + "?" + querystring.stringify(para);
    //console.log(u);
    http.request(u, handler).end();
}

function getMsg(req, res) {
    console.log("get msg");
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    });
    //console.log(23333);

    var data_all = parseTxtData('movie_data/StarWars_interaction_sessions.txt');

    var time = 0;

    var child_executable = platform == "win32" ? "Debug/StreamingStoryline.exe" : "gintama";
    var optimizer_executable = "python ../optimizer/main.py";
    var child = spawn('storyline-layout/' + child_executable);
    var preslice = "{}";
    child.stdout.on('data', function(data) {
        //console.log("response", data.toString());
        var req = {
            "preslice": preslice,
            "current": data.toString()
        };
        submit_get_request("http://localhost:23334/tasks/optimizer", req, function (response) {
            response = response.replace(/\n+/g, '');
            res.write("data:" + response + "\n\n");
            console.log(response + "\n\n");
            preslice = response;
        });
        //var optimizer_child = spawn(optimizer_executable + ' "' + data.toString() + '"');
        //var result = '';
        //optimizer_child.stdout.on('data', function(_d) {
        //    //result += _d.toString();
        //    res.write("data:" + _d + "\n\n");
        //});
        //optimizer_child.on('close', function () {
        //    res.write("data:" + result + "\n\n");//});
    });

    var timer = setInterval(function() {
        var str = time + ' ';
        var len = data_all.events[time].length;
        var visited = {};
        for (var j = 0; j < len; j++) {
            var members = data_all.sessions[data_all.events[time][j]].members;

            // avoid entity duplicate
            var unvisited = [];
            for (var i_m in members) {
                var m = members[i_m];
                if (visited[m]) {
                    continue;
                }
                visited[m] = true;
                unvisited.push(m);
            }

            str += JSON.stringify(unvisited).split(/[\[\]]/)[1];
            str += ' ';
        }
        //console.log("input", str);
        child.stdin.write(str + '\n');
        time++;

        if (data_all.events[time] == undefined) {
            child.stdin.write('#\n');
            child.stdin.end();
            res.write("data:over\n\n");
            console.log("finish");
            clearInterval(timer);
        }
    }, 2000);
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
