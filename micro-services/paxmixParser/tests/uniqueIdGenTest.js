'use strict';

var assert = require('assert');
var uniqueIdGen = require('./../lib/uniqueIdGen');

describe('uniqueIdGen Parser Tests ', function () {
    before(function() {
        uniqueIdGen.init(0,0);
    });

    it('It should be possible to generate 10000 unique ids', function (done) {
        var resultList = {};
        var i = 0;
        for (i = 0; i < 10000; i++) {
            var result = uniqueIdGen.getUniqueId();
            resultList[result] = result;
        }
        console.log(resultList);
        assert.equal(Object.keys(resultList).length,10000);
        done();
    });
});