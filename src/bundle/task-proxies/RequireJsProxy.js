/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
require('sjljs');

// Import base task proxy to extend
var FilesTaskProxy = require('../FilesTaskProxy'),
    fs = require('fs'),
    header = require('gulp-header'),
    requirejs = require('requirejs'),
    duration = require('gulp-duration'),
    chalk = require('chalk'),
    path = require('path');

module.exports = FilesTaskProxy.extend(function RequireJsProxy(options) {
    FilesTaskProxy.apply(this, options);
    this.name = 'requirejs';
}, {

    registerGulpTask: function (taskName, requireJsOptions, gulp, wrangler) {

        // Create task for bundle
        gulp.task(taskName, function () {

            // Date for tracking task duration
            var start = new Date();

            // Message "Running task"
            wrangler.log(chalk.cyan('\nRunning "' + taskName + '" task.'), '--mandatory');

            requirejs.optimize(requireJsOptions, function (buildResponse) {
                //buildResponse is just a text output of the modules
                //included. Load the built file for the contents.
                //Use config.out to get the optimized file contents.
                wrangler.log(buildResponse, '--mandatory');

                // Notify of task completion and task duration
                wrangler.log(chalk.cyan(chalk.green(String.fromCharCode(8730)) +
                    ' "requirejs" task completed.  Duration: ') +
                    chalk.magenta((((new Date()) - start) / 1000) + 'ms'), '--mandatory');

            }, function(err) {
                //optimization err callback
                wrangler.log(chalk.red('r.js encountered an error:\n' + err), '--mandatory');
            });

        }); // end of requirejs task
    },

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

            // Bundle name for task
            bundleName = bundle.options.name,

            // Task name
            taskName = self.name + separator + bundleName,

            // Rjs command (adding prefix for windows version)
            requireJsOptions = self.getRequireJsOptions(bundle);

        self.registerGulpTask(taskName, requireJsOptions, gulp, wrangler);

    }, // end of `registerBundle`

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this;
        bundles.forEach(function (bundle) {
            self.registerBundle(bundle);
        });
    },

    getRequireJsOptions: function (bundle) {
        var rjsOptions = null;
        if (bundle.has('requirejs.buildConfigPath')) {
            // Load build config
            rjsOptions = yaml.safeLoad(
                fs.readFileSync(
                    bundle.options.requirejs.buildConfigPath));
        }
        else if (bundle.has('requirejs.options')) {
            //
            rjsOptions = bundle.options.requirejs.options;
        }
        return rjsOptions;
    },

    isBundleValidForTask: function (bundle) {
        return bundle.has('requirejs.buildConfigPath') || bundle.has('requirejs.options');
    }

}); // end of export
