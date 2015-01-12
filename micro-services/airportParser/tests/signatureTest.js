'use strict';

var assert = require('assert');
var signature = require('./../lib/signature');
var packageJson = require('./../package.json');

describe('signature Tests ', function () {
    it('It should be possible to get a signature', function (done) {
        var result = signature.getSignature(packageJson);
        assert(packageJson.name + '.v' + packageJson.version, result.service);
        console.log(result);
        done();
    });
});