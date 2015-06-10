/**
 * Created by edelacruz on 1/6/2015.
 */

'use strict';

require('sjljs');

var childProcess = require('child_process'),
    exec = childProcess.exec,
    log = console.log;

module.exports = (function () {
    return {
        executeTaskAsChild: function (tasksCommand, options, test, doneCallback) {
            log('\nRunning test for "' + tasksCommand + '" command.');

            // Execute command
            exec(tasksCommand, options, function (error, stdout, stderr) {
                log('command executed');
                if (!sjl.empty(stderr)) {
                    log('stderr: ' + stderr);
                }

                if (!sjl.empty(error)) {
                    log(error);
                }

                if (sjl.classOfIs(test, 'Function')) {
                    test(error, stdout, stderr);
                    doneCallback();
                }

                log('\nTest for "' + tasksCommand + '" completed.');
                doneCallback();
            });
        }
    };
}());
