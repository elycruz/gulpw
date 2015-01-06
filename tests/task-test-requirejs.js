/**
 * Created by ElyDeLaCruz on 10/29/2014.
 */

'use strict';

require('sjljs');

var chai = require('chai'),

    path = require('path'),

    testProjectPath = path.join(__dirname, '..', '..', 'gulpw-sample-app'),

    child_process = require('child_process'),

    exec = child_process.exec,

    log = console.log;

// Get `chai.expect`
if (!global.expect) {
    global.expect = chai.expect;
}

describe('#`requirejs` task test', function () {

    before(function (done) {
        // Clean all outputted artifacts before outputting new ones
        exec('gulpw clean', {cwd: testProjectPath}, function (error, stdout, stderr) {
            log('\n"clean" task performed.\n');
            if (!sjl.empty(stderr)) {
                log('stderr: ' + stderr);
            }
            if (!sjl.empty(error)) {
                log(error);
            }
            log('\nProceeding with other tests..\n');
            done();
        });
    });

    it ('should output build sources when using the `dir` option', function (done) {
        exec('gulpw requirejs:amd', {cwd: testProjectPath}, function (error, stdout, stderr) {
            log(stdout, testProjectPath);
            if (!sjl.empty(stderr)) {
                log('stderr: ' + stderr);
            }
            if (!sjl.empty(error)) {
                log(error);
            }
            expect(sjl.empty(stderr)).to.equal(true);
            expect(sjl.empty(error)).to.equal(true);

            // Validate outputted directory structure with files here.

            log('\n"requirejs:amd" test completed.');

            done();

        });
    });

    it ('should output an "out" file when using the `out` option', function (done) {
        exec('gulpw requirejs:amd-outfile', {cwd: testProjectPath}, function (error, stdout, stderr) {
            log(stdout, testProjectPath);
            if (!sjl.empty(stderr)) {
                log('stderr: ' + stderr);
            }
            if (!sjl.empty(error)) {
                log(error);
            }
            expect(sjl.empty(stderr)).to.equal(true);
            expect(sjl.empty(error)).to.equal(true);

            // Validate that there is an 'out' file here.

            log('\n"requirejs:amd" test completed.');

            done();

        });
    });

});
