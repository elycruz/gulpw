/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
"use strict"; require("sjljs");

// Import base task proxy to extend
var FilesHashTaskProxy = require('../FilesHashTaskProxy'),
    fs = require('fs'),
    Promise = global.Promise || require('es6-promise').Promise,
    header = require('gulp-header'),
    requirejs = require('requirejs'),
    duration = require('gulp-duration'),
    chalk = require('chalk'),
    path = require('path');

module.exports = FilesHashTaskProxy.extend(function RequireJsProxy(options) {
    FilesHashTaskProxy.apply(this, options);
    this.alias = 'requirejs';
}, {

    // @todo add a `getTaskNameForBundle` method
    registerGulpTask: function (taskName, requireJsOptions, gulp, wrangler, bundle) {
        var self = this;

        // Create task for bundle
        gulp.task(taskName, function () {
            var classOfRequireJs = sjl.classOf(bundle.get('requirejs')),
                promise = new Promise(function (fulfill, reject) {
                    if (classOfRequireJs === 'Object') {
                        self.runRequireTaskInline(taskName, bundle, requireJsOptions, gulp, wrangler, fulfill, reject);
                    }
                    else if (classOfRequireJs === 'String') {
                        self.runRequireTaskAsCommand(taskName, bundle, requireJsOptions, gulp, wrangler, fulfill, reject);
                    }
                    else {
                        wrangler.log('Requirejs task config is of invalid type.' +
                            '  Type recieved: ' + classOfRequireJs, '--mandatory');
                    }
                });

            return promise;

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
            bundleName = bundle.options.alias,

            // Task name
            taskName = self.alias + separator + bundleName,

            // Rjs command (adding prefix for windows version)
            requireJsOptions = self.getRequireJsOptions(bundle);

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

            // Register singular task
            self.registerGulpTask(taskName, self.getRequireJsOptions(bundle), gulp, wrangler, bundle);
        });

        // If we have targets register them
        if (targets.length > 0) {
            self.registerGulpTasks('requirejs', targets, gulp, wrangler);
        }

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
            rjsOptions = bundle.options.requirejs.options;
        }
        else {
            rjsOptions = bundle.get('requirejs');
        }
        return rjsOptions;
    },

    runRequireTaskInline: function (taskName, bundle, requireJsOptions, gulp, wrangler, fulfill, reject) {
        // Date for tracking task duration
        var start = new Date(),
            otherOptions = {};

        // @todo add flag in yaml to allow optimize type (for advanced usages)
        if (!wrangler.argv.dev) {
            otherOptions.optimize = 'uglify';
        }

        // Message "Running task"
        wrangler.log(chalk.cyan('\nRunning "' + taskName + '" task.'), '--mandatory');

        requirejs.optimize(sjl.extend({}, requireJsOptions, otherOptions),
            function (buildResponse) {
                //buildResponse is just a text output of the modules
                //included. Load the built file for the contents.
                //Use config.out to get the optimized file contents.
                wrangler.log(buildResponse, '--mandatory');

                // Notify of task completion and task duration
                wrangler.log('[' + chalk.green('gulp') +  ']' +
                chalk.cyan(' requirejs "' + taskName + '" completed.  Duration: ') +
                chalk.magenta((((new Date()) - start) / 1000) + 'ms'), '--mandatory');
                fulfill();
            }, function(err) {
                //optimization err callback
                wrangler.log(chalk.red('r.js encountered an error:\n' + err), '--mandatory');
                reject('r.js encountered an error:\n' + err);
            });
    },

    runRequireTaskAsCommand: function () {

    },

    isBundleValidForTask: function (bundle) {
        return bundle.has('requirejs.buildConfigPath') || bundle.has('requirejs.options');
    }

}); // end of export
