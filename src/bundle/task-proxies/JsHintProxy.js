/**
 * Created by edelacruz on 10/8/2014.
 */
"use strict"; require("sjljs");

// Import base task proxy to extend
var gulpif = require('gulp-if'),
    jshint = require('gulp-jshint'),
    duration = require('gulp-duration'),
    TaskProxy = require('../TaskProxy'),
    path = require('path'),
    chalk = require('chalk'),
    callback = require('gulp-fncallback'),
    lazypipe = require('lazypipe');

module.exports = TaskProxy.extend("JsHintProxy", {

    /**
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

        // Task string separator
        var self = this,
            separator = wrangler.getTaskStrSeparator(),
            taskName = 'jshint' + separator + bundle.options.alias,
            filesToExclude = wrangler.tasks.jshint.ignoredFiles,
            src;

        if (!self.isBundleValidForTask(bundle)) {
            return;
        }

        src = self.getTargetsForBundle(bundle, wrangler);

        if (filesToExclude && Array.isArray(filesToExclude)) {
            src = src.filter(function (item) {
                return filesToExclude.indexOf(path.basename(item)) === -1;
            });
        }

        gulp.task(taskName, function () {

            wrangler.log(chalk.cyan('Running "' + taskName + '"'), '--mandatory');

            return gulp.src(src)

                // Get prebuilt pipe
                .pipe(self.getPipe(bundle, gulp, wrangler)());
        });

    }, // end of `registerBundle`


    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            targets = [],
            deps = [];

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            //self.registerBundle(bundle, gulp, wrangler);
            targets = self.getTasksForBundle(bundle, ['jshint'], wrangler).concat(targets);
        });

        self.registerGulpTasks('jshint', targets, gulp, wrangler);
    },

    getTargetsForBundle: function (bundle, wrangler) {
        var targets = [];
        if (bundle.has('files.js')) {
            targets = targets.concat(bundle.options.files.js);
        }
        // @todo Allow both use of appdir and dir for requirejs resources jshint
        if (bundle.has('requirejs')) {
            targets.push(path.join(bundle.options.requirejs.options.dir, '**/*.js'));
        }
        // @todo If bundle has browserify
        return targets;
    },

    isBundleValidForTask: function (bundle) {
        return bundle && (bundle.has('files.js') || bundle.has('requirejs') || bundle.has('browserify'));
    },

    getPipe: function (bundle, gulp, wrangler) {
        var self = this,
            jsHintConfig = wrangler.tasks.jshint.jshintrc || wrangler.tasks.jshint.options,
            useFailReporter = false;

        if (sjl.empty(self.pipe)) {
            self.pipe = lazypipe()
                //.pipe(callback, function (file, enc, cb) {
                //    wrangler.log(chalk.grey('Linting: ' + file.path), '--mandatory');
                //    return cb ? cb() : file;
                //})
                .pipe(jshint, jsHintConfig)
                .pipe(duration, chalk.cyan("jshint \"" + bundle.options.alias + "\" duration"))
                .pipe(jshint.reporter, 'jshint-stylish');

            if (useFailReporter) {
                self.pipe.pipe(jshint.reporter, 'fail');
            }
        }
        return self.pipe;
    }

});
