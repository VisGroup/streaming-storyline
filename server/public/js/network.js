/*
\param  method -- 'GET' or 'POST'
\param  url -- for example '/sync?time=1&data=2'
\param  func -- call back function
*/
var send = function(method, url, data, func) {
    $.ajax({
        type: method,
        url: url,
        data: data,
        success: func
    });
}

var gintama = function(func) {// receive a data
    send('GET', '/gintama', {}, func);
}

var es;
var startFuck = function() {
    es = new EventSource('/msg');

    es.onmessage = function (e) {
        console.log(e.data);
        if (e.data == "over") {
            es.close();
        }
    }
}
