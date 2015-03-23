/**
 * Created by ElyDeLaCruz on 10/29/2014.
 */

'use strict';

require('sjljs');

var chai = require('chai'),
    path = require('path'),
    log = console.log,
    tutil = require('./../src/test-utils/test-utils'),
    genericTest = function (error, stdout, stderr) {
        log('Generic test recieved params:', error, stderr);
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

describe('#`build` task test', function () {

    before(function (done) {
        // Set timeout for test
        this.timeout(timeout);
        //tutil.executeTaskAsChild('gulpw clean', commandOptions, null, done);
        done();
    });

    it('should build all bundles when no bundle name is passed in', function (done) {
        // Set timeout for test
        this.timeout(timeout);
        tutil.executeTaskAsChild('gulpw build', commandOptions, genericTest, done);
    });

    it('should be able to build a bundle that has "requirejs" section', function (done) {
        // Set timeout for this test
        this.timeout(timeout);
        tutil.executeTaskAsChild('gulpw build:amd-outfile', commandOptions, genericTest, done);
    });

    it('should be able to build multiple singular bundles', function (done) {
        // Set timeout for this test
        this.timeout(timeout);
        tutil.executeTaskAsChild('gulpw build:global build:amd build:amd-outfile',
            commandOptions, genericTest, done);
    });

});
