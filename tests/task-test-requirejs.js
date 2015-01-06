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
    timeout = 13000,
    log = console.log;

// Get `chai.expect`
if (!global.expect) {
    global.expect = chai.expect;
}

describe('#`requirejs` task test', function () {

    before(function (done) {
        // Clean all outputted artifacts before outputting new ones
        exec('gulpw clean:amd clean:amd-outfile', {cwd: testProjectPath, timeout: timeout}, function (error, stdout, stderr) {
            log('\n"clean:amd" and "clean:amd-outfile" tasks performed.\n');
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
        // Set timeout for test
        this.timeout(timeout);

        log ('\nRunning test for "requirejs:amd" task.');

        // Execute gulpw command
        exec('gulpw requirejs:amd', {cwd: testProjectPath, timeout: timeout}, function (error, stdout, stderr) {
            if (!sjl.empty(stderr)) {
                log('stderr: ' + stderr);
            }
            if (!sjl.empty(error)) {
                log(error);
            }
            expect(sjl.empty(stderr)).to.equal(true);
            expect(sjl.empty(error)).to.equal(true);

            // Validate outputted directory structure with files here.

            log('\nTest for "requirejs:amd" completed.');
            done();
        });
    });

    it ('should output an "out" file when using the `out` option', function (done) {

        // Set timeout for this test
        this.timeout(timeout);

        log ('\nRunning test for "requirejs:amd-outfile" task.');

        // Execute gulpw command
        exec('gulpw requirejs:amd-outfile', {cwd: testProjectPath, timeout: timeout}, function (error, stdout, stderr) {
            if (!sjl.empty(stderr)) {
                log('stderr: ' + stderr);
            }
            if (!sjl.empty(error)) {
                log(error);
            }
            expect(sjl.empty(stderr)).to.equal(true);
            expect(sjl.empty(error)).to.equal(true);

            // Validate that there is an 'out' file here.

            log('\nTest for "requirejs:amd-outfile" completed.');
            done();

        });
    });

    it ('should output artifacts for all bundles that contain a "requirejs" key', function (done) {

        // Set timeout for this test
        this.timeout(timeout);

        log ('\nRunning test for "requirejs" task.');

        // Execute gulpw command
        exec('gulpw requirejs', {cwd: testProjectPath, timeout: timeout}, function (error, stdout, stderr) {
            if (!sjl.empty(stderr)) {
                log('stderr: ' + stderr);
            }
            if (!sjl.empty(error)) {
                log(error);
            }
            expect(sjl.empty(stderr)).to.equal(true);
            expect(sjl.empty(error)).to.equal(true);

            // Validate that artifacts were outputted here.

            log('\nTest for "requirejs" completed.');
            done();
        });
    });

});
