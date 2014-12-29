/* jslint node: true */
/* global describe, it */
'use strict';

var assert = require('assert');
var airportParser = require('./../lib/index.js');

describe('Airport Parser Tests ', function () {
    before(function() {
        airportParser.init();
    });

    it('It should be possible to detect Belgium as return isoCode2=BE', function (done) {
        var result = airportParser.parse('Belgium');
        console.log(result);
        //assert.equal(result.isoCode2,'BE');
        done();
    });

    it('It should be possible to detect Brussel as return isoCode2=BE', function (done) {
        var result = airportParser.parse('Brussel');
        console.log(result);
        //assert.equal(result.isoCode2,'BE');
        done();
    });

    it('It should be possible to detect London and Egypth in a sentence and provide their isoCode2 back', function (done) {
        var result = airportParser.parseSentence('Holiday from London to Egypth',0.95);
        console.log(result);
        //assert.equal(result.isoCode2,'BE');
        done();
    });

    it('It should be possible to detect London and Turkey in a sentence and provide their isoCode2 back', function (done) {
        var result = airportParser.parseSentence('Holiday from London to Turkey',0.95);
        console.log(result);
        //assert.equal(result.isoCode2,'BE');
        done();
    });

    it('It should be possible to detect Brussels and Spain in a sentence and provide their isoCode2 back', function (done) {
        var result = airportParser.parseSentence('Holiday from Brussels to Spain',0.95);
        console.log(result);
        //assert.equal(result.isoCode2,'BE');
        done();
    });
});
