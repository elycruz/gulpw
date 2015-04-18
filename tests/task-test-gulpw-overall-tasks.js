/**
 * Created by edelacruz on 1/6/2015.
 */

'use strict';

require('sjljs');

var chai = require('chai'),
    path = require('path'),
    tutil = require(path.join(__dirname, '../src/test-utils/test-utils')),
    genericTest = function (error, stdout, stderr) {
        expect(sjl.empty(stderr)).to.equal(true);
        expect(sjl.empty(error)).to.equal(true);
    },
    timeout = 34000,
    commandOptions = {
        cwd: path.join(__dirname, '..', '..', 'gulpw-sample-app'),
        timeout: timeout
    };

// Get `chai.expect`
if (!global.expect) {
    global.expect = chai.expect;
}

describe('#global tasks test', function () {

    before(function (done) {
        // Set timeout for test
        this.timeout(timeout);
        tutil.executeTaskAsChild('gulpw clean', commandOptions, null, done);
    });

    it ('should be able to run more than one global task when passed in separately', function (done) {
        // Set timeout for test
        this.timeout(timeout);
        tutil.executeTaskAsChild('gulpw build deploy',
            commandOptions, genericTest, done);
    });

});
