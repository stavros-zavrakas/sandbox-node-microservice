/* jslint node: true */
/* global describe, it */
'use strict';

var assert = require('assert');
var ip2geolocation = require('./../lib/ip2geolocation.js');
var signature =  require('./../lib/signature.js');
var packageJson = require('./../package.json');

describe('ip2geolocation Tests ', function () {
    before(function() {
        ip2geolocation.init(signature.getSignature(packageJson));
    });

    it('It should be possible to detect our office using 195.59.205.57', function (done) {
        var message = {
            metadata : {},
            ipAddress : '195.59.205.57',
            results : {}
        };
        var result = ip2geolocation.processMessage(
            message,
            function(err,action,message){
                console.log(message);
                assert.equal(action,'processed');
                done();
            });
    });
});
