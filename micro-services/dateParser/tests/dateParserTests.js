/* jslint node: true */
/* global describe, it */
'use strict';

var assert = require('assert');
var dateParser = require('./../lib/index.js');

describe('date Parser Tests ', function () {
    it('It should be possible to find next christmas day', function (done) {
        var result = dateParser.parseSentence('Holiday from Brussels to Spain next christmas', function(err, result){
            console.log(result);
            done();
        });
    });

    it('It should be possible find next month', function (done) {
        var result = dateParser.parseSentence('Holiday from Brussels to Spain next month', function(err, result){
            console.log(result);
            done();
        });
    });

    it('It should be possible find next month', function (done) {
        var result = dateParser.parseSentence('Holiday from Brussels to Spain next summer', function(err, result){
            console.log(result);
            done();
        });
    });
});
