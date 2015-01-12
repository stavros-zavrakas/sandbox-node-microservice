var argh = require('argh');
var redis = require("redis");
var dateParser = require("./lib/dateParser.js");
var signature = require("./lib/signature");
var packageJson = require("./package.json");

var opts = {
    'port': argh.argv.redisPort || 6379,
    'ip': argh.argv.redisIp || '127.0.0.1',
    'topic': argh.argv.topic || 'search.ip2geolocation.v1'
};

var signature = signature.getSignature(packageJson);
dateParser.init(signature);

var consumer = redis.createClient(opts.port, opts.ip, {});
var producer = redis.createClient(opts.port, opts.ip, {});

consumer.on("subscribe", function (channel, count) {
    console.log('consumer subscribed on : ' + channel)
});

consumer.on("message", function (channel, message) {
    message = JSON.parse(message);
    dateParser.processMessage(message, function (err, action, result) {
        if (action == 'processed') {
            producer.publish(opts.topic, JSON.stringify(result));
        }
    })
});

consumer.subscribe(opts.topic);

exports.shutdown = function () {
    producer.end();
    consumer.end();
};