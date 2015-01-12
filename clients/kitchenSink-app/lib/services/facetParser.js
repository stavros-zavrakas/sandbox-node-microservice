var fp = {};
var msClient = require('./microserviceClient.js')
var Map = require('hashtable/es6-map');

fp._topic = "search.facetextractor.v1";
fp._consumer = null;
fp._messages = new Map();

/**
 * Parse a given string and return the facets found
 * @param str
 * @param options {
 *    ttl : timeout, how long maximum to wait to give results back
 * }
 * @param cb
 */
fp.parse = function parse(str, options, cb){
    var ttl = options.ttl || 300;
    var message = {
        q : str
    };

    fp._produce(message,function(err, messageId){
        fp._messages.set(messageId, {cb : cb, start : process.hrtime(), ttl : ttl});

        setTimeout(function(){
            var msg = fp._messages.get(messageId);
            console.log(JSON.stringify(msg));
            fp._messages.delete(messageId);
            msg.cb(null, msg);
        }, ttl);
    });
};

fp._produce = function produce(message, cb){
    msClient.produce(fp._topic, message,cb);
};

/**
 * Logic goes here to see when we are happy with the result message,
 * timeouts have to be handled here too
 * @param err
 * @param msg
 */
fp._onMessage = function consume(err,msg){

};

fp.init = function(){
  if (!fp._consumer){
      fp._consumer = msClient.consume(fp._topic,{ownProducedMessagesOnly:true},fp._onMessage)
  }

};

function init()
{
    fp.init();
    return fp;
}

module.exports = init();

