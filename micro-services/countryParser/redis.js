var argh = require('argh');
var redis = require("redis");
var countryParser = require("./lib/countryParser.js");
var signature = require("./lib/signature");
var packageJson = require("./package.json");


var opts = {
    'port' : argh.argv.redisPort || 6379,
    'ip' : argh.argv.redisIp || '127.0.0.1',
    'topic' : argh.argv.topic || 'search.facetextractor.v1'
};

var signature = signature.getSignature(packageJson);
countryParser.init(signature);

var consumer = redis.createClient(opts.port, opts.ip, {});
var producer = redis.createClient(opts.port, opts.ip, {});

consumer.on("subscribe", function (channel, count) {
  console.log('consumer subscribed on : ' + channel)
});

consumer.on("message", function (channel, message) {
  message = JSON.parse(message);
  countryParser.processMessage(message,function(err,action,result){
      if (action == 'processed'){
          producer.publish(opts.topic,JSON.stringify(result));
      }
  })
});

consumer.subscribe(opts.topic);

exports.shutdown = function(){
    producer.end();
    consumer.end();
};