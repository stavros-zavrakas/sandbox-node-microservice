'use strict';

var assert = require('assert');
var uniqueIdGen = require('./../../lib/uniqueIdGen.js');
var msClient = require('./../../lib/services/microserviceClient');
var redis = require('redis');
var messageHandler = {};
var REDIS_PORT = '6379';
var REDIS_IP = '127.0.0.1';
var consumer = initConsumer(REDIS_PORT,REDIS_IP);

describe('microserviceClient Parser Tests ', function () {
    before(function() {
        msClient.init({
            'port' : REDIS_PORT, //default redis port
            'ip' : REDIS_IP, //local host
            'serviceId' : uniqueIdGen.getUniqueId(), //ensure an unique id for this service
            'producedMessageTTL' : 60 //60 seconds ttl
        });
    });

    it('It should be possible to see a message', function(done){
        //Create a consumer to see if our producer works
        var producer = redis.createClient(msClient._opts.port, msClient._opts.ip);
        //Create a random topic
        var topic = uniqueIdGen.getUniqueId();
        messageHandler[topic] = function(channel,message){
            assert.equal(message,"test message");
            done();
        };
        consumer.subscribe(topic);
        producer.publish(topic,"test message");
    });

    it('It should be possible to produce a new message', function (done) {
        //Create a random topic
        var topic = uniqueIdGen.getUniqueId();
        //Create a new message
        var message = {
            q : 'holiday in spain'
        };

        //Create a listener for the topic and validate if the message was produced correctly
        messageHandler[topic] = function(channel,data){
            var msg = JSON.parse(data);
            assert.equal(message.q,msg.q);
            assert.ok(msg._metadata);
            assert.ok(msg._metadata.id);
            assert.ok(msg._metadata.timer.start);
           done();
        };

        consumer.subscribe(topic);
        msClient.produce(topic,message,function(err){

        });
    });

    it('It should be possible to register a message', function (done) {
        var consumer = redis.createClient(REDIS_PORT, REDIS_IP);
        //Create a new message
        var message = {
            _metadata : {
              id : msClient._getNewMessageId()
            },
            q : 'holiday in spain'
        };
        msClient._registerProducedMessage(message,function(err){
            consumer.get(message._metadata.id,function(err,data){
                assert.deepEqual(message,JSON.parse(data));
                done();
            });
        });
    });

    it('It should be possible to see if the message was one of own produced messages', function (done) {
        //Create a new message
        var message = {
            _metadata : {
                id : msClient._getNewMessageId()
            },
            q : 'holiday in spain'
        };
        //register a new message
        msClient._registerProducedMessage(message,function(err){
            //Validate if the new message is one we did register
            msClient._isProducedMessage(message,function(err,isProducedMessage){
                assert(true,isProducedMessage);
                done();
            });
        });
    });

    it('It should be possible to consumer own produced messages', function (done) {
        //Create a random topic
        var topic = uniqueIdGen.getUniqueId();

        //Create a new message
        var message = {
            _metadata : {
                id : msClient._getNewMessageId()
            },
            q : 'holiday in spain'
        };

        //Register a consumer for the topic
        msClient.consume(topic,{ownProducedMessagesOnly:true},function(err,msg){
            if (err){
                done(err);
            }
            if (msg.event == 'subscribed'){
                //Publish the message
                msClient.produce(topic,message,function(err, items){
                    if (err){
                        done(err);
                    }
                });
            } else
            if (msg.event == 'message'){
                assert(msg.message._metadata.id, message._metadata.id);
                done();
            }
        });
    });
});

function initConsumer(port,ip){
    //Create a consumer to see if our producer works
    consumer = redis.createClient(port, ip);
    //See if we are subscribing on a channel
    consumer.on("subscribe", function (channel, count) {
        //console.log('consumer subscribed on : ' + channel)
    });
    //Start Listening on messages
    consumer.on("message", function (channel, message) {
        //console.log(channel,message);
        if (typeof messageHandler[channel] ==  "function"){
            messageHandler[channel](channel, message);
        }
    });

    return consumer;
}