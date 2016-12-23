/*
\param  method -- 'GET' or 'POST'
\param  url -- for example '/sync?time=1&data=2'
\param  func -- call back function
*/
var dataset_selector;
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

var submit_optimizer_request = function (request) {
    $.post("localhost:23334/tasks/optimizer", slice, function (result) {
        storyline.update(result);
    });
};

var es;
var start_loading = function(storyline) {
// <<<<<<< HEAD
    load_started = true;
    // es = new EventSource('/msg');
// =======
    es = new EventSource('/msg?dataset=' + dataset_selector.val());
// >>>>>>> master

    es.onmessage = function (e) {
        //console.log(e);
        if (e.data == "over") {
            es.close();
            return;
        }
        var slice;
        eval("slice=" + e.data);
        //console.log(slice.time);
        storyline.update(slice);
        //submit_optimizer_request(slice);
    }
};
