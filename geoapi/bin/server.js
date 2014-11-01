'strict true';
var argh = require('argh');
var redis = require('redis');
var geonames = require('node-geonames-client');

var opts = {
    'username': argh.argv.username || process.env.MS_GN_USERNAME,
    'redis' : argh.argv.redis || process.env.MS_REDIS
};


var geonames = require('node-geonames-client'); //({username:opts.username});
var redisPublisher = redis.createClient();
var redisListener = redis.createClient();

redis.debug_mode = false;

redisListener.on("psubscribe", function (pattern, count) {
    console.log("client1 psubscribed to " + pattern + ", " + count + " total subscriptions");
});

redisListener.on("punsubscribe", function (pattern, count) {
    console.log("client1 punsubscribed from " + pattern + ", " + count + " total subscriptions");
    redisListener.end();
});

redisListener.on("pmessage", function (pattern, channel, message) {
    console.log(pattern,channel,JSON.parse(message));

});

redisListener.psubscribe("search.geo*");


