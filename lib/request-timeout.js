/**
 * Request Timeout Module
 */
module.exports = timeout;

var global = require('../src/serverroot/common/global');

function responseEnd(res)
{
    if (res.end.proxied) {
        return;
    }
    var old = res.end;
    res.end = function() {
        res.end = old;
        res.end.apply(res, arguments);
        res.emit('end');
    }
    res.end.proxied = true;
}

function timeout (req, res, milliSeconds) 
{
    responseEnd(res);

    var len = milliSeconds;
    if (milliSeconds == null) {
        len = global.DFLT_HTTP_REQUEST_TIMEOUT_TIME;
    }
    var timer = false;

    function clear() {
        clearTimeout(timer);
        timer = false;
    }

    function start(len) {
        if (timer) {
            return;
        }
        len = req.timeout.length = len || req.timeout.length;
        timer = setTimeout(expire, len);
    }

    function reset(len) {
        clear();
        start(len);
    }

    function expire() {
        req.emit('timeout', req, res);
        clear();
    }

    req.timeout = {
        length: len,
        timer: timer,
        start: start,
        clear: clear,
        reset: reset,
        expire: expire
    }

    start();
    res.on('end', clear);
}

