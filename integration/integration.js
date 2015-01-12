var argh = require('argh');
var redis = require("redis");

var opts = {
    'port' : argh.argv.redisPort || 6379,
    'ip' : argh.argv.redisIp || '127.0.0.1',
    'topic' : argh.argv.topic || 'search.facetextractor.v1'
};

var fasetSearchConsumer = redis.createClient(opts.port, opts.ip, {});
var producer = redis.createClient(opts.port, opts.ip, {});

fasetSearchConsumer.on("subscribe", function (channel, count) {
    console.log('consumer subscribed on : ' + channel)
});

fasetSearchConsumer.on("message", function (channel, message) {
    message = JSON.parse(message);
    message.metadata.timer.duration = stopTimer( message.metadata.timer.start);
    message = JSON.stringify(message);

    console.log("-----------------------------------------------")
    console.log("consumer channel " + channel + ": " + message);
    console.log("-----------------------------------------------")
});

fasetSearchConsumer.subscribe('search.facetextractor.v1');

//Facet extraction
producer.publish('search.facetextractor.v1',JSON.stringify(
    {
    metadata : {
        messageId : "",
        timer : {
            start : startTimer()
        }
    },
    q : 'Holiday from Brussels to Spain next christmas'
}));

exports.shutdown = function(){
    producer.end();
    fasetSearchConsumer.end();
};


/**
 * Starts a high resolution operating system timer
 * @return {Array} An array of [number, number] representing the time in [whole seconds, the nanoseconds remainder]
 */
function startTimer() {
    return process.hrtime();
}

/**
 * Computes the delta between now and a `startTimer()` call
 * using a high resolution timer.
 * @param  {Array} start a result from `startTimer()`
 * @return {number}       The time delta in whole milliseconds
 */
function stopTimer(start) {
    var end = process.hrtime(start);

    return parseInt(((end[0] + end[1] / 1e9) * 1e3), 10);
}
