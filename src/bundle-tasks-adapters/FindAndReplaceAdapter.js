/**
 * Created by ElyDeLaCruz on 10/5/2014.
 * @todo write tests for this task
 * @note currently only tested with raw strings (not tested with regular expressions).
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    path = require('path'),
    gulpReplace = require('gulp-replace'),
    gulpDuration = require('gulp-duration'),
    gwUtils = require('./../Utils'),
    chalk = require('chalk');

module.exports = BaseBundleTaskAdapter.extend(function FindAndReplaceAdapter(/*options*/) {
    BaseBundleTaskAdapter.apply(this, arguments);
}, {

    registerGulpTask: function (taskName, gulp, wrangler, bundle) {
        var self = this;

        // Create task for bundle
        gulp.task(taskName, function () {

            var config = self.wrangler.cloneOptionsFromWrangler('tasks.findandreplace', bundle.get('findandreplace')),
                options = sjl.issetObjKeyAndOfType(config, 'options') ? config.options : {skipBinary: true},
                files = bundle.get('findandreplace.files'),
                classOfFiles = sjl.classOf(files),
                destDir = config.destDir,
                searchHash = gwUtils.objectHashToMap(config.findandreplace, function (key) {
                    var regex,
                        retVal;
                    if (sjl.classOfIs(key, 'RegExp')) {
                        retVal = key;
                    }
                    else {
                        try {
                            regex = new RegExp(key);
                            retVal = regex.toString().indexOf(key) > -1 ? regex : key;
                        }
                        catch (e) {
                            retVal = key;
                        }
                    }
                    return retVal;
                }),
                retVal;

            // Message 'Running task'
            console.log(chalk.cyan('Running "' + taskName + '" task.\n'));

            if (classOfFiles === 'String' || classOfFiles === 'Array') {
                retVal = self._processFilesArrayOrString(files, searchHash, options, taskName);
            }
            else if (classOfFiles === 'Object') {
                throw new Error ('no support for files hash object yet.');
            }

            return retVal;

            // pipe
            //    .pipe(gulp.dest(destDir))
            //    .pipe(gulpDuration(chalk.cyan('"' + taskName + '" duration: ')))
            //    .on('end', function () {
            //        console.log('findandreplace stream end event.');
            //    });

        }); // end of findandreplace task
    },

    registerBundle: function (bundle, gulp, wrangler) {
        this.registerGulpTask(this.getTaskNameForBundle(bundle), gulp, wrangler, bundle);
    },

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
            taskName = self.getTaskNameForBundle(bundle);

            // Push task name to targets list
            targets.push(taskName);

            self.registerBundle(bundle, gulp, wrangler);

            // Register singular task
            self.registerGulpTask(taskName, gulp, wrangler, bundle);
        });

        // If we have targets register them
        if (targets.length > 0) {
            self.registerGulpTasks('findandreplace', targets, gulp, wrangler);
        }
    },

    isBundleValidForTask: function (bundle) {
        return bundle.has('findandreplace.files')
            && bundle.has('findandreplace.findandreplace');
    },

    _processFilesArrayOrString: function (files, searchHash, gulpTaskOptions, taskName) {
        var self = this;
        if (Array.isArray(files)) {
            files = gwUtils.explodeGlobs(files);
        }
        else if (sjl.classOfIs(files, 'String')) {
            files = gwUtils.explodeGlob(files);
        }

        return (new Promise(function (resolve, reject) {

            var completedLen = 0,
                expectedCompletedLen = files.length,
                interval;

                files.forEach(function (file, index) {
                    var pipe = self.gulp.src(file),
                        destDir = path.dirname(file);

                    // Search and r                                                                                                                               eplace all keys in search hash
                    searchHash.forEach(function (replaceWith, searchStr) {
                        console.log(arguments[0], arguments[1]);
                        pipe = pipe.pipe(gulpReplace(searchStr, replaceWith, gulpTaskOptions));
                    }); // end of hash map loop

                    pipe.pipe(gulp.dest('./hello'));
                        //.on('end', function () {
                        //    completedLen += 1;
                        //    console.log('findandreplace stream end event fired.');
                        //})
                        //.on('error', function (err) {
                        //    console.log('error', err);
                        //    expectedCompletedLen -= 1;
                        //});

                }); // end of files loop


            // Set completed interval
            interval = setInterval(function () {
                if (completedLen === expectedCompletedLen) {
                    resolve();
                    clearInterval(interval);
                }
                else if (completedLen > expectedCompletedLen) {
                    reject('An unkown error occurred.');
                    clearInterval(interval);
                }
            }, 100);

        })); // end of promise

    } // end of process files

}) ; // end of export
