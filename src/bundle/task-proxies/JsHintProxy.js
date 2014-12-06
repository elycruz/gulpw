/**
 * Created by edelacruz on 10/8/2014.
 */
require('sjljs');

// Import base task proxy to extend
var gulpif = require('gulp-if'),
    jshint = require('gulp-jshint'),
    duration = require('gulp-duration'),
    TaskProxy = require('../TaskProxy'),
    path = require('path'),
    chalk = require('chalk'),
    callback = require('gulp-fncallback');

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
            taskName = 'jshint' + separator + bundle.options.name,
            jsHintConfig = wrangler.tasks.jshint.options,
            useFailReporter = false,
            filesToExclude = wrangler.tasks.jshint.ignoredFiles,
            src;

        if (!self.isBundleValidForTask(bundle)) {
            return;
        }

        src = bundle.options.files.js;

        if (filesToExclude && Array.isArray(filesToExclude)) {
            src = src.filter(function (item) {
                return filesToExclude.indexOf(path.basename(item)) === -1;
            });
        }

        gulp.task(taskName, function () {
            wrangler.log(chalk.cyan('Running "' + taskName + '"'), '--mandatory');
            gulp.src(src)
                .pipe(callback(function (file, enc, cb) {
                    wrangler.log('Linting: ' + file.path, '--mandatory');
                    return cb ? cb() : file;
                }))
                .pipe(jshint(jsHintConfig))
                .pipe(duration(chalk.cyan("jshint \"" + bundle.options.name + "\" duration")))
                .pipe(jshint.reporter('jshint-stylish'))
                .pipe(gulpif(useFailReporter, jshint.reporter('fail')));
        });

    }, // end of `registerBundle`


    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            jsHintConfig = wrangler.tasks.jshint.options,
            useFailReporter = false,
            targets = [];

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            targets = targets.concat(bundle.options.files.js);
        });

        gulp.task('jshint', function () {
            gulp.src(targets)
                .pipe(jshint(jsHintConfig))
                .pipe(duration("jshint duration"))
                .pipe(jshint.reporter('jshint-stylish'))
                .pipe(gulpif(useFailReporter, jshint.reporter('fail')));
        });

    },

    isBundleValidForTask: function (bundle) {
        return bundle && bundle.has('files.js');
    }
});
