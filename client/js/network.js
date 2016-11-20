/*
\param  method -- 'GET' or 'POST'
\param  url -- for example '/sync?time=1&data=2'
\param  func -- call back function
*/
var sendData = function(method, url, data, func) {
    $.ajax({
        type: method,
        url: url,
        data: data,
        success: func
    });
}
