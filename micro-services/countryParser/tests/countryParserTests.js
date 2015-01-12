/* jslint node: true */
/* global describe, it */
'use strict';

var assert = require('assert');
var countryParser = require('./../lib/countryParser.js');
var signature =  require('./../lib/signature.js');
var packageJson = require('./../package.json');

describe('Country Parser Tests ', function () {
    before(function() {
        countryParser.init(signature.getSignature(packageJson));
    });

    it('It should be possible to detect Belgium as return isoCode2=BE', function (done) {
        var result = countryParser.parse('Belgium');
        console.log(result);
        assert.equal(result.country.isoCode2,'BE');
        done();
    });

    it('It should be possible to detect Brussel as return isoCode2=BE', function (done) {
        var result = countryParser.parse('Brussel');
        console.log(result);
        assert.equal(result.country.isoCode2,'BE');
        done();
    });

    it('It should be possible to detect London and Egypt in a sentence and provide their isoCode2 back', function (done) {
        var result = countryParser.parseSentence('Holiday from London to Egypt',0.95);
        console.log(result);
        //assert.equal(result.isoCode2,'BE');
        done();
    });

    it('It should be possible to detect London and Turkey in a sentence and provide their isoCode2 back', function (done) {
        var result = countryParser.parseSentence('Holiday from London to Turkey',0.95);
        console.log(result);
        //assert.equal(result.isoCode2,'BE');
        done();
    });

    it('It should be possible to detect Brussels and Spain in a sentence and provide their isoCode2 back', function (done) {
        var result = countryParser.parseSentence('Holiday from Brussels to Spain',0.95);
        console.log(result);
        //assert.equal(result.isoCode2,'BE');
        done();
    });
});
