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
};

var gintama = function(func) {// receive a data
    send('GET', '/gintama', {}, func);
};

var es;
var start_loading = function(storyline) {
    es = new EventSource('/msg');

    es.onmessage = function (e) {
        console.log(e);
        if (e.data == "over") {
            es.close();
            return;
        }
        var slice;
        eval("slice=" + e.data);
        console.log(slice.time);
        storyline.update(slice);
    }
};
