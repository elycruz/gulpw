/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var FilesHashTaskAdapter = require('./FilesHashTaskAdapter'),
    requirejs = require('requirejs'),
    chalk = require('chalk');

module.exports = FilesHashTaskAdapter.extend(function RequireJsAdapter(options) {
    FilesHashTaskAdapter.apply(this, arguments);
}, {

    // @todo add a `getTaskNameForBundle` method
    registerGulpTask: function (taskName, requireJsOptions, gulp, wrangler, bundle) {
        var self = this;

        // Create task for bundle
        gulp.task(taskName, function () {
            var classOfRequireJs = sjl.classOf(bundle.get('requirejs')),
                retVal;
                    if (classOfRequireJs === 'Object') {
                        retVal = self.runRequireTaskInline(taskName, bundle, requireJsOptions, gulp, wrangler);
                    }
                    else if (classOfRequireJs === 'String') {
                        retVal = self.runRequireTaskAsCommand(taskName, bundle, requireJsOptions, gulp, wrangler);
                    }
                    else {
                        console.log('Requirejs task config is of invalid type.' +
                            '  Type recieved: ' + classOfRequireJs + '\n');
                    }

            return retVal;
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

            // Bundle name for task
            bundleName = bundle.options.alias,

            // Task name
            taskName = self.alias + ':' + bundleName,

            // Rjs command (adding prefix for windows version)
            requireJsOptions = self.getRequireJsOptions(bundle, wrangler);

        self.registerGulpTask(taskName, requireJsOptions, gulp, wrangler, bundle);

    }, // end of `registerBundle`

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            taskName,
            targets;

        // If we do not have any bundles, bail
        if (!Array.isArray(bundles) || sjl.empty(bundles)) {
            return;
        }

        // Init targets list
        targets = [];

        // Loop through bundles for task name
        bundles.forEach(function (bundle) {

            // If bundle not valid skip it
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }

            // Get task name
            taskName = 'requirejs:' + bundle.options.alias;

            // Push task name to targets list
            targets.push(taskName);

            self.registerBundle(bundle, gulp, wrangler);

            // Register singular task
            self.registerGulpTask(taskName, self.getRequireJsOptions(bundle), gulp, wrangler, bundle);
        });

        // If we have targets register them
        if (targets.length > 0) {
            self.registerGulpTasks('requirejs', targets, gulp, wrangler);
        }

    },

    getRequireJsOptions: function (bundle, wrangler) {
        var rjsOptions = null;
        if (bundle.has('requirejs.buildConfigPath')) {
            // Load build config
            rjsOptions = wrangler.loadConfigFile(
                bundle.options.requirejs.buildConfigPath);
        }
        else if (bundle.has('requirejs.options')) {
            rjsOptions = bundle.options.requirejs.options;
        }
        else {
            rjsOptions = bundle.get('requirejs');
        }
        return rjsOptions;
    },

    runRequireTaskInline: function (taskName, bundle, requireJsOptions, gulp, wrangler) {
        // Date for tracking task duration
        var start = new Date(),
            otherOptions = {},
            promise;

        // @todo add flag in yaml to allow optimize type (for advanced usages)
        if (!wrangler.argv.dev) {
            otherOptions.optimize = 'uglify';
        }

        // Message 'Running task'
        console.log(chalk.cyan('Running "' + taskName + '" task.\n'));

        promise = new Promise(function (fulfill, reject) {
            requirejs.optimize(sjl.extend({}, requireJsOptions, otherOptions),
                function (buildResponse) {
                    //buildResponse is just a text output of the modules
                    //included. Load the built file for the contents.
                    //Use config.out to get the optimized file contents.
                    console.log(chalk.grey('"' + taskName + '" outfile.txt output:'),
                        buildResponse);

                    // Notify of task completion and task duration
                    console.log('[' + chalk.green('gulp') +  ']' +
                        chalk.cyan(' "' + taskName + '" completed.  Duration: ') +
                        chalk.magenta((((new Date()) - start) / 1000) + 'ms\n'));

                    fulfill();

                }, function(err) {
                    //optimization err callback
                    console.log(chalk.red('r.js encountered an error:\n' + err + '\n'));
                    reject('r.js encountered an error:\n' + err + '\n');
                });
        });

        return promise;

    },

    runRequireTaskAsCommand: function () {

    },

    isBundleValidForTask: function (bundle) {
        return bundle.has('requirejs.buildConfigPath') || bundle.has('requirejs.options');
    }

}); // end of export
