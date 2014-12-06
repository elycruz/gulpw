/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
require('sjljs');

// Import base task proxy to extend
var FilesTaskProxy = require('../FilesTaskProxy'),
    fs = require('fs'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    gulpif = require('gulp-if'),
    duration = require('gulp-duration'),
    chalk = require('chalk'),
    os = require('os'),
    exec = require('child_process').exec,
    path = require('path');

module.exports = FilesTaskProxy.extend(function RequireJsProxy(options) {
    FilesTaskProxy.apply(this, options);
    this.name = 'requirejs';
}, {

    /**
     * Regsiters bundle with requirejs gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

        // If bundle doesn't have any of the required keys, bail
        if (!this.isBundleValidForTask(bundle)) {
            return;
        }

        // Task string separator
        var self = this,

            // Task Separator
            separator = wrangler.getTaskStrSeparator(),

            // RequireJs Config Section
            requireJsOptions = wrangler.tasks.requirejs,

            // To minify or not to minify ... haha
            devMode = wrangler.argv.dev,

            // Bundle name for task
            bundleName = bundle.options.name,

            // Task name
            taskName = self.name + separator + bundleName,

            // Rjs command (adding prefix for windows version)
            rjsCommandName = 'r.js' + (os.platform().toLowerCase().indexOf('windows') ? '.cmd' : '');

        // Create task for bundle
        gulp.task(taskName, function () {

            // Date for tracking task duration
            var start = new Date();

            // Message "Running task"
            wrangler.log(chalk.cyan('\nRunning "' + taskName + '" task.'), '--mandatory');

            // Execute r.js command
            exec(rjsCommandName + ' -o ' + bundle.options.requirejs.buildConfigPath, {cwd: process.cwd()},

                // "Child Process Execute" callback
                function (error, stdout, stderr) {

                    // Replace extraneous '\n' characters at the end of `stdout` and output `stdout`
                    wrangler.log (chalk.grey(stdout.replace(/\n+$/g, '\n')), '--mandatory');

                    // If error, log it
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }

                    // If `stderr` log it
                    if (stderr) {
                        console.log('stderr: ' + stderr);
                    }

                    // Notify of task completion and task duration
                    wrangler.log(chalk.cyan(chalk.green(String.fromCharCode(8730)) + ' "requirejs" task completed.  Duration: ') +
                        chalk.magenta((((new Date()) - start) / 1000) + 'ms'), '--mandatory');

                }); // end of execution callback

        }); // end of requirejs task

    }, // end of `registerBundle`

    isBundleValidForTask: function (bundle) {
        return bundle.has('requirejs');
    }

}); // end of export
