'use strict';

var assert = require('assert');
var airportParser = require('./../lib/airportParser.js');
var signature =  require('./../lib/signature.js');
var packageJson = require('./../package.json');

describe('Airport Parser Tests ', function () {
    before(function() {
        airportParser.init(signature.getSignature(packageJson));
    });

    it('It should be possible to detect Belgium as return an airport with iataCode=BRU', function (done) {
        var result = airportParser.parse('Belgium');
        //Should be brussels, this because we set priority to 1 for Brussels airport (score:1);
        assert.equal(result.airport.iataCode,'BRU');
        console.log(result);
        done();
    });

    it('It should be possible to detect Brussel as return an airport with iataCode=BRU', function (done) {
        var result = airportParser.parse('Brussels');
        console.log(result);
        assert.equal(result.airport.iataCode,'BRU');
        done();
    });

    it('It should be possible to detect London and Egypt in a sentence and provide their iataCodes back', function (done) {
        var result = airportParser.parseSentence('Holiday from London to Egypt',0.95);
        console.log(result);
        assert.equal(result[0].airport.iataCode,'LON');
        assert.equal(result[1].airport.iataCode,'SSH');
        done();
    });

    it('It should be possible to detect London and Turkey in a sentence and provide their iataCodes back', function (done) {
        var result = airportParser.parseSentence('Holiday from London to Turkey',0.95);
        console.log(result);
        assert.equal(result[0].airport.iataCode,'LON');
        assert.equal(result[1].airport.iataCode,'AYT');
        done();
    });

    it('It should be possible to detect Brussels and Spain in a sentence and provide their iataCodes back', function (done) {
        var result = airportParser.parseSentence('Holiday from Brussels to Spain',0.95);
        console.log(result);
        assert.equal(result[0].airport.iataCode,'BRU');
        assert.equal(result[1].airport.iataCode,'LPA');
        done();
    });

    it('It should be possible to process a new message and extract brussels and spain airports ', function (done) {
        var result = airportParser.processMessage({
           metadata : {},
           q : 'Holiday from Brussels to Spain'
        },
        function(err,action,message){
            console.log(message);
            assert.equal(action,'processed');
            done();
        });
    });

    it('It should be possible to ignore a processed message', function (done) {
        var message = {
            metadata : {},
            q : 'Holiday from Brussels to Spain',
            results : {}
        };
        message.results[signature.getSignature(packageJson).service] = {};
        var result = airportParser.processMessage(
            message,
            function(err,action,message){
                console.log(message);
                assert.equal(action,'ignored');
                done();
            });
    });
});
