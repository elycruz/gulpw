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

describe('#`build` task test', function () {

    //before(function (done) {
    //    // Clean all outputted artifacts before outputting new ones
    //    exec('gulpw clean:amd clean:amd-outfile', {cwd: testProjectPath, timeout: timeout}, function (error, stdout, stderr) {
    //        log('\n"clean:amd" and "clean:amd-outfile" tasks performed.\n');
    //        if (!sjl.empty(stderr)) {
    //            log('stderr: ' + stderr);
    //        }
    //        if (!sjl.empty(error)) {
    //            log(error);
    //        }
    //        log('\nProceeding with other tests..\n');
    //        done();
    //    });
    //});

});
