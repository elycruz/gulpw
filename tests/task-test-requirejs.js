/**
 * Created by ElyDeLaCruz on 10/29/2014.
 */

'use strict';

require('sjljs');

var chai = require('chai'),
    path = require('path'),
    tutil = require(path.join(__dirname, '../src/test-utils/test-utils')),
    timeout = 21000,
    commandOptions = {
        cwd: path.join(__dirname, '..', 'node_modules', 'gulpw-sample-app'),
        timeout: timeout
    };

// Get `chai.expect`
if (!global.expect) {
    global.expect = chai.expect;
}

describe('#`requirejs` task test', function () {

    before(function (done) {
        // Set timeout for test
        this.timeout(timeout);
        //tutil.executeTaskAsChild('gulpw clean', commandOptions, null, done);
        done();
    });

    it ('should output build sources when using the `dir` option', function (done) {
        // Set timeout for test
        this.timeout(timeout);
        tutil.executeTaskAsChild('gulpw requirejs:amd', commandOptions, null, done);
    });

    it ('should output an "out" file when using the `out` option', function (done) {
        // Set timeout for test
        this.timeout(timeout);
        tutil.executeTaskAsChild('gulpw requirejs:amd-outfile', commandOptions, null, done);
    });

    it ('should output artifacts for all bundles that contain a "requirejs" key', function (done) {
        // Set timeout for test
        this.timeout(timeout);
        tutil.executeTaskAsChild('gulpw requirejs', commandOptions, null, done);
    });

});
