/**
 */

var msClient = {};
var redis = require('redis');
var extend = require('util')._extend;
var uniqueIdGen = require('./../../lib/uniqueIdGen');

/**
 * see init(opts) for details
 * @private
 */
msClient._opts = {
    port : 6379,
    ip : '127.0.0.1',
    serviceId : uniqueIdGen.getUniqueId(),
    producedMessageTTL : 60
};

/**
 * Array off registered redis consumers
 * @type {Array}
 * @private
 */
msClient._consumers = [];

/**
 * Redis Producer
 * @private
 */
msClient._producer = null;

/**
 * Initialise the microServiceClient, it uses the default Redis configuration,
 * but can be overridden by passing an opts object.
 *
 * options:
 *   redisPort : the port where to find redis, default 6379
 *   redisIp : the ip address where to find redis, default localhost
 *   serviceId : used to see if consumed messages are produced by this service, default a unique id is generated
 *   producedMessageTTL : TLL for how long we keep register of produced message Ids in seconds, default set to 60 seconds
 */
msClient.init = function init(opts){
    //override default config if new config is given
    var opts = {
        'port' : opts.redisPort || msClient._opts.port,
        'ip' : opts.redisIp || msClient._opts.ip,
        'serviceId' : opts.serviceId || msClient._opts.serviceId,
        'producedMessageTTL' : opts.producedMessageTTL || msClient._opts.producedMessageTTL

    };
    //create a redis client to keep track of messages produced by this service
    msClient._producedMessageIdsRedisClient = redis.createClient(opts.port, opts.ip, {});
    //create a redis client to produce new messages
    msClient._producer = redis.createClient(opts.port, opts.ip, {});
};

/**
 * Attach a function to receive all consumed messages, this could be useFull for debugging purpose
 * @type {*}
 */
msClient.onConsumeMessage = null;

/**
 * Attach a function to receive all consumed messages parsing Errors, this could be useFull for debugging purpose
 * @type {*}
 */
msClient.onConsumeMessageError = null;

/**
 * Create a new consumer for a given topic, a cb function has to be provided, which will be triggered on each message
 * Currently only consumes self produced JSON messages !!!!
 * @param topic : topic to listen on e.g. "search.facetparser.v1"
 * @param opts : {
 *   ownProducedMessagesOnly : only give a callback for own produced messages
 *
 *   }
 * @param cb
 */
msClient.consume = function consume(topic, opts, cb){

    var consumer = {
        client : redis.createClient(msClient._opts.port, msClient._opts.ip, {}),
        opts : opts,
        topic : topic,
        cb : cb
    };

    /*consumer.__thomasCook = {
        ownProducedMessagesOnly : opts.ownProducedMessagesOnly,
        cb : cb
    };*/

    //Add the consumer to the list of active consumers
    msClient._consumers.push(consumer);

    consumer.client.on("subscribe", function (channel, count) {
        consumer.cb(null,{
            event : 'subscribed',
            topic : channel,
            message : null
        });
    });

    //Start Listening on messages
    consumer.client.on("message", function (channel, message) {
        msClient._processConsumedMessage(consumer, channel, message);
    });

    consumer.client.subscribe(topic);
};

/**
 * Produce a new message on a given topic
 * Currently only consumes self produced JSON messages !!!!
 * @param topic : topic to produce on "search.facetparser.v1"
 * @param message : the message to produce
 * @param cb : function(err)
 */
msClient.produce = function produce(topic, message, cb){
    message._metadata = message._metadata || {};
    message._metadata.id = message._metadata.id || msClient._getNewMessageId();
    message._metadata.timer = {};
    message._metadata.timer.start = msClient._startTimer();

    //Register the message as being produced by this instance
    msClient._registerProducedMessage(message, function(err){
        if (err){
            return cb(err);
        }
        //Publish the message
        msClient._producer.publish(topic,JSON.stringify(message),function(err, items){
            if (err){
                return cb(err);
            }
            //Return the messageId
            cb(err,message._metadata.id);
        });
    });
};

msClient._getNewMessageId = function(){
    return msClient._opts.serviceId + '.' + uniqueIdGen.getUniqueId();
};


/**
 * Process a consumed message, transform to JSON and See if the message was produced by this client
 * @param consumer
 * @param channel
 * @param message
 * @private
 */
msClient._processConsumedMessage = function(consumer, channel, message){
    //Parse the message
    // parse the message, when fails
    try {
        jsonMessage = JSON.parse(message);
    }
    catch(err){
        if (typeof msClient.onConsumeMessageError == 'function'){
            msClient.onConsumeMessageError({channel:channel, message:message, error : err});
        }
    }
    //Add the duration for the message in ms
    jsonMessage._metadata.timer.duration = msClient._stopTimer(jsonMessage);

    var result = {
            event : 'message',
            topic : channel,
            message : jsonMessage,
            producedByThisService : false
        };

    //See if the message was produced by this producer when this option is enabled
    if (consumer.opts.ownProducedMessagesOnly){
        msClient._isProducedMessage(jsonMessage, function(err, data){
            if (err){
                return consumer.cb(err);
            }
            if (data){
                result.producedByThisService = true;
                //onConsumeMessage, can be used for monitoring or debugging purpose
                if (typeof msClient.onConsumeMessage == 'function'){
                    msClient.onConsumeMessage(result);
                }
                return consumer.cb(null,result);
            }
            else {
              console.log('unconsumed message ', result);
            }
        });
    }
    //Just return the message
    else {
        if (typeof msClient.onConsumeMessage == 'function'){
            msClient.onConsumeMessage(result);
        }
        return consumer.__thomasCook.cb(null,result);
    }





};

/**
 * Check if a message was produced by this producer.
 * @param message
 * @param cb
 * @private
 */
msClient._isProducedMessage = function(message, cb){
    var id = message._metadata.id;
    msClient._producedMessageIdsRedisClient.get(id, function(err, data) {
       // data is null if the key doesn't exist
       var data = JSON.parse(data);
       if(err || data === null) {
           return cb(err, false);
       } else {
           return cb(null, true);
       }
    });
};

/**
 * Register a message for this producer, a ttl is set see init for details
 * @param message
 * @param cb
 * @private
 */
msClient._registerProducedMessage = function(message, cb){
    var opts = msClient._opts;
    var key = message._metadata.id;
    msClient._producedMessageIdsRedisClient.setex(key, opts.producedMessageTTL, JSON.stringify(message), function(err) {
        cb(err);
    });
};

/**
 * Starts a high resolution operating system timer
 * @return {Array} An array of [number, number] representing the time in [whole seconds, the nanoseconds remainder]
 */
msClient._startTimer = function startTimer() {
    return process.hrtime();
};

/**
 * Computes the delta between now and a `startTimer()` call
 * using a high resolution timer.
 * @param  {Array} start a result from `startTimer()`
 * @return {number}       The time delta in whole milliseconds
 */
msClient._stopTimer = function stopTimer(message) {
    var start = message._metadata.timer.start; //TODO safely get the start
    var end = process.hrtime(start);
    return parseInt(((end[0] + end[1] / 1e9) * 1e3), 10);
};

/**
 * Shutdown all Redis Connections
 */
msClient.shutDown = function(){
    msClient._producer.end();
    msClient._producedMessageIdsRedisClient.end();
    msClient._consumers.forEach(function(consumer){
        consumer.client.end();
    });
    msClient._consumers = [];
};

module.exports = msClient;

