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

    it ('should output build sources when using the `dir` option', function (done) {
        exec('gulpw requirejs:amd', {cwd: testProjectPath}, function (error, stdout, stderr) {
            log(stdout, testProjectPath);
            if (!sjl.empty(stderr)) {
                log('stderr: ' + stderr);
            }
            if (!sjl.empty(error)) {
                log(error);
            }
            done();
        });
    });

});
