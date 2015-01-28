/**
 * Created by ElyDeLaCruz on 10/29/2014.
 */

'use strict';

require('sjljs');

var chai = require('chai'),
    path = require('path'),
    tutil = require('./../src/test-utils/test-utils'),
    genericTest = function (error, stdout, stderr) {
        expect(sjl.empty(stderr)).to.equal(true);
        expect(sjl.empty(error)).to.equal(true);
    },
    timeout = 13000,
    commandOptions = {
        cwd: path.join(__dirname, '..', '..', 'gulpw-sample-app'),
        timeout: timeout
    };

// Get `chai.expect`
if (!global.expect) {
    global.expect = chai.expect;
}

describe('#`mocha` task test', function () {

    it ('should be able to run for a singular bundle', function (done) {
        // Set timeout for test
        this.timeout(timeout);
        // Execute gulpw command
        tutil.executeTaskAsChild('gulpw mocha:mocha-tests --verbose', commandOptions, genericTest, done);
    });

    it ('should be able to run for all bundles that contain a "mocha" key', function (done) {
        // Set timeout for test
        this.timeout(timeout);
        // Execute gulpw command
        tutil.executeTaskAsChild('gulpw mocha --verbose', commandOptions, genericTest, done);
    });

});
