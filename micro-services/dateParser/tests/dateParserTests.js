/* jslint node: true */
/* global describe, it */
'use strict';

var assert = require('assert');
var dateParser = require('./../lib/index.js');
var moment = require('moment')

describe('date Parser Tests ', function () {
    it('It should be possible to find next christmas day', function (done) {
        var result = dateParser.parseSentence('Holiday from Brussels to Spain next christmas', function(err, result){
            assert(result[0].value, moment().add(1, 'year').format('YYYY') + '-12-25');
            console.log(result);
            done();
        });
    });

    it('It should be possible find next month', function (done) {
        var result = dateParser.parseSentence('Holiday from Brussels to Spain next month', function(err, result){
            assert(result[0].value, moment().add(1, 'month').format('YYYY-MM-DD'));
            console.log(result);
            done();
        });
    });

    it('It should not be possible find next summer', function (done) {
        var result = dateParser.parseSentence('Holiday from Brussels to Spain next summer', function(err, result){
            assert(result[0].value,'invalid date');
            console.log(result);
            done();
        });
    });
});
