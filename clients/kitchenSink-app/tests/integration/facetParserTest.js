'use strict';

var assert = require('assert');
var fp = require('./../../lib/services/facetParser.js');
var uniqueIdGen = require('./../../lib/uniqueIdGen.js');
var msClient = require('./../../lib/services/microserviceClient');
var REDIS_PORT = '6379';
var REDIS_IP = '127.0.0.1';

describe('facetParser Tests ', function () {
    before(function() {
        msClient.init({
            'port' : REDIS_PORT, //default redis port
            'ip' : REDIS_IP, //local host
            'serviceId' : uniqueIdGen.getUniqueId(), //ensure an unique id for this service
            'producedMessageTTL' : 60 //60 seconds ttl
        });
    });

    it('It should be possible to parse a string and get facets back', function (done) {
        fp.parse('holiday from belgium to spain next christmas',{},function(err,result){
            if (err){
                return done(err);
            }
            console.log(result);
            done();
        })
    });
});