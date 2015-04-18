/**
 * Created by edelacruz on 10/8/2014.
 */

'use strict';

require('sjljs');


var path = require('path'),
    del = require('del'),
    chalk = require('chalk'),
    BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter');

module.exports = BaseBundleTaskAdapter.extend(function CleanAdapter () {
        BaseBundleTaskAdapter.apply(this, arguments);
    }, {

        registerGulpTask: function (taskSuffix, targets, gulp, wrangler) {

            // Get task start time
            var start = new Date(),

                // Get task name
                taskName = 'clean' + (taskSuffix ? taskSuffix : '');

            // Define 'clean' task
            gulp.task(taskName, function () {

                return (new Promise(function (fulfill, reject) {

                    // Explode
                    targets = wrangler.explodeGlobs(targets);

                    // Log start of task
                    console.log(chalk.cyan('Running "' + taskName + '"\n'));

                    // Log files to delete
                    wrangler.log(chalk.grey('Deleting the following files:\n'), chalk.grey(targets), '\n');

                    // Delete targets
                    del(targets, function (err) {

                        // If error log it
                        if (err) {
                            console.log(err, '\n');
                            reject(err);
                            return;
                        }

                        // Log completion of task
                        console.log('[' + chalk.green('gulp') +'] ' + chalk.cyan(taskName + ' duration: ')
                        + chalk.magenta((((new Date()) - start) / 1000) + 'ms\n'));

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
                minifyConfig = wrangler.tasks.minify,
                isMinifyConfigured = !wrangler.tasks.minify.notConfiguredByUser;

            // Register separate `clean` tasks for each section in `files` key
            allowedFileTypes.forEach(function (ext) {
                var section = bundle.has('files.' + ext),
                    singularTaskTargets = [],
                    artifactPath = path.join(minifyConfig[ext + 'BuildPath'], bundleName + '.' + ext);

                // Check if `key` in `files` is buildable (concatable/minifiable)
                if (bundle.has('files') && self.isValidTaskSrc(section)) {

                    // Get file path for `key` in `files`
                    if (isMinifyConfigured
                        && minifyConfig[ext + 'BuildPath']
                        && singularTaskTargets.indexOf(artifactPath) === -1) {
                        singularTaskTargets.push(artifactPath);
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
                minifyConfig = wrangler.tasks.minify,
                isMinifyConfigured = !wrangler.tasks.minify.notConfiguredByUser;

            bundles.forEach(function (bundle) {
                var bundleName = bundle.options.alias;

                // Compile targets array
                allowedFileTypes.forEach(function (ext) {

                    var section = bundle.has('files.' + ext) ? bundle.options.files[ext] : [],
                        copyFiles = bundle.get('copy.files');

                    // Check if `key` in `files` is buildable (concatable/minifiable)
                    if (bundle.has('files') && self.isValidTaskSrc(section)) {

                        // Get file path for `key` in `files`
                        if (isMinifyConfigured && minifyConfig[ext + 'BuildPath']
                            && targets.indexOf(path.join(minifyConfig[ext + 'BuildPath'], bundleName + '.' + ext)) === -1) {
                                    targets.push(path.join(minifyConfig[ext + 'BuildPath'], bundleName + '.' + ext));
                                }
                    }

                    // If requirejs config is availble
                    if (bundle.has('requirejs.options.out') && targets.indexOf(bundle.options.requirejs.options.out) === -1) {
                        targets.push(bundle.options.requirejs.options.out);
                    }
                    else if (bundle.has('requirejs.options.dir') && targets.indexOf(bundle.options.requirejs.options.dir) === -1) {
                        targets.push(path.join(bundle.options.requirejs.options.dir, '/**/*'));
                        // @todo should we also delete the actual dir ?
                        targets.push(bundle.options.requirejs.options.dir);
                    }

                    // If copy tasks is setup
                    if (bundle.has('copy.files')) {
                        Object.keys(copyFiles).forEach(function (key) {
                            if (targets.indexOf(copyFiles[key]) === -1) {
                                targets.push(copyFiles[key]);
                            }
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