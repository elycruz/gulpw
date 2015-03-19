/**
 * Created by edelacruz on 10/8/2014.
 */

'use strict';

require('sjljs');
require('es6-promise').polyfill();

var path = require('path'),
    del = require('del'),
    chalk = require('chalk'),
    TaskAdapter = require('../TaskAdapter.js');

module.exports = TaskAdapter.extend(function CleanAdapter (options) {
        TaskAdapter.call(this, sjl.extend({alias: 'clean'}, options));
    }, {

        /**
         * Registers the clean gulp task for a `taskSuffix`.
         * @param taskSuffix {String} - Required
         * @param targets {Array|String} - Required
         * @param gulp {gulp} - Required
         * @param wrangler {Wrangler} - Required
         * @return {void}
         */
        registerGulpTask: function (taskSuffix, targets, gulp, wrangler) {

            // Get task start time
            var start = new Date(),

                // Get task name
                taskName = 'clean' + (taskSuffix ? taskSuffix : '');

            // Define 'clean' task
            gulp.task(taskName, function () {

                return (new Promise(function (fulfill, reject) {
                    // Log start of task
                    wrangler.log('Running "' + taskName + '"', '--mandatory');

                    // Log files to delete
                    wrangler.log('Deleting the following files: \n', targets);

                    // Delete targets
                    del(targets, function (err) {

                        // If error log it
                        if (err) {
                            console.log(err);
                            reject(err);
                            return;
                        }

                        // Log completion of task
                        wrangler.log('[' + chalk.green('gulp') +'] ' + chalk.cyan(taskName + ' duration: ')
                        + chalk.magenta((((new Date()) - start) / 1000) + 'ms'), '--mandatory');

                        fulfill();

                    }); // end of deletion of targets

                })); // end of promise

            }); // End of 'clean' task

        }, // End of `registerGulpTask`

        /**
         * Registers bundle with the `clean` task.
         * @param gulp {gulp} - Required
         * @param wrangler {Wrangler} - Required
         * @param bundle {Bundle} - Required
         * @returns {void}
         */
        registerBundle: function (bundle, gulp, wrangler) {

            var self = this,
                bundleName = bundle.options.alias,
                allowedFileTypes = wrangler.tasks.clean.allowedFileTypes || ['js', 'html',  'css'],
                separator = ':',
                targets = [],
                minifyConfig = wrangler.tasks.minify;

            // Register separate `clean` tasks for each section in `files` key
            allowedFileTypes.forEach(function (ext) {
                var section = bundle.options.files[ext],
                    singularTaskTargets = [];

                // Check if `key` in `files` is buildable (concatable/minifiable)
                if (bundle.has('files') && self.isValidTaskSrc(section)) {

                    // Get file path for `key` in `files`
                    if (minifyConfig[ext + 'BuildPath']) {
                        singularTaskTargets.push(path.join(minifyConfig[ext + 'BuildPath'], bundleName + '.' + ext));
                    }

                    // Pass off the `filePath` to `targets` for later use
                    targets = targets.concat(singularTaskTargets);

                    // Register task for `key`
                    self.registerGulpTask(separator + bundleName + separator + ext, singularTaskTargets, gulp);
                }
            });

            // If clean key is set with a valid buildable src
            if (self.isValidTaskSrc(bundle.options.clean)) {
                self.registerGulpTask(separator + bundleName, bundle.options.clean, gulp, wrangler);
            }

            if (bundle.has('requirejs.options')) {
                // @todo allow using the requirejs outfile as a target here
                if (!sjl.empty(bundle.options.requirejs.options.out)) {
                    targets.push(path.join(process.cwd(), bundle.options.requirejs.options.out) + path.sep);
                }
                else if (!sjl.empty(bundle.options.requirejs.options.dir)) {
                    targets.push(path.join(process.cwd(), bundle.options.requirejs.options.dir) + path.sep);
                }
                self.registerGulpTask(separator + bundleName + separator + 'requirejs', targets, gulp, wrangler);
            }

            // Register overall clean task
            if (targets.length > 0) {
                self.registerGulpTask(separator + bundleName, targets, gulp, wrangler);
            }
        },

        registerBundles: function (bundles, gulp, wrangler) {
            var self = this,
                targets = [],
                allowedFileTypes = wrangler.tasks.clean.allowedFileTypes || ['js', 'html',  'css'],
                minifyConfig = wrangler.tasks.minify;

            bundles.forEach(function (bundle) {
                var bundleName = bundle.options.alias;

                // Compile targets array
                allowedFileTypes.forEach(function (ext) {
                    var section = bundle.options.files[ext],
                        copyFiles = bundle.get('copy.files');

                    // Check if `key` in `files` is buildable (concatable/minifiable)
                    if (bundle.has('files') && self.isValidTaskSrc(section)) {

                        // Get file path for `key` in `files`
                        if (minifyConfig[ext + 'BuildPath']) {
                            targets.push(path.join(minifyConfig[ext + 'BuildPath'], bundleName + '.' + ext));
                        }
                    }

                    // If requirejs config is availble
                    if (bundle.has('requirejs.options.out')) {
                        targets.push(bundle.options.requirejs.options.out);
                    }
                    else if (bundle.has('requirejs.options.dir')) {
                        targets.push(path.join(bundle.options.requirejs.options.dir, '/**/*'));
                        // @todo should we also delete the actual dir ?
                        //targets.push(bundle.options.requirejs.options.dir);
                    }

                    // If copy tasks is setup
                    if (bundle.has('copy.files')) {
                        Object.keys(copyFiles).forEach(function (key) {
                            targets.push(copyFiles[key]);
                        });
                    }
                });

                // If clean key is set with a valid buildable src
                if (self.isValidTaskSrc(bundle.options.clean)) {
                    targets = targets.concat(bundle.options.clean);
                }

            }); // end of bundles loop

            // Register overall clean task
            if (targets.length > 0) {
                self.registerGulpTask('', targets, gulp, wrangler);
            }

        }
});