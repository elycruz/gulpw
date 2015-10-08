/**
 * Created by ElyDeLaCruz on 10/5/2014.
 * @todo write tests for this task
 * @note currently only tested with raw strings (not tested with regular expressions).
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
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
                pipe,
                searchHash = gwUtils.objectHashToMap(config.findandreplace, function (key) {
                    var regex,
                        retVal;
                    if (sjl.classOfIs(key, 'RegExp')) {
                        retVal = key;
                    }
                    else {
                        try {
                            regex = new RegExp(key);
                            retVal =  regex.toString().indexOf(key) > -1  ? regex : key;
                        }
                        catch (e) {
                            retVal = key;
                        }
                    }
                    return retVal;
                });

            // Message 'Running task'
            console.log(chalk.cyan('Running "' + taskName + '" task.\n'));

            pipe = gulp.src(bundle.get('findandreplace.files'))
                .pipe(gulpReplace(options));

            // Search and replace all keys in search hash
            searchHash.forEach(function (value, key) {
                pipe = pipe.pipe(gulpReplace(key, value, options));
            });

            return pipe
                .pipe(gulp.dest('./replaced'))
                .pipe(gulpDuration(chalk.cyan('"' + taskName + '" duration: ')));

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
    }

}); // end of export
