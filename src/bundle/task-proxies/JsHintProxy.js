/**
 * Created by edelacruz on 10/8/2014.
 */
require('sjljs');

// Import base task proxy to extend
var gulpif = require('gulp-if'),
    jshint = require('gulp-jshint'),
    duration = require('gulp-duration'),
    TaskProxy = require('../TaskProxy');

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
            jsHintConfig = wrangler.tasks.jshint.options,
            useFailReporter = false;

        if (!self.isBundleValidForTask(bundle)) {
            return;
        }

        gulp.task('jshint' + separator + bundle.options.name, function () {
            gulp.src(bundle.options.files.js)
                .pipe(jshint(jsHintConfig))
                .pipe(duration("JsHinting \"" + bundle.options.name + "\""))
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
                .pipe(duration("JsHinting:" + ext + "\""))
                .pipe(jshint.reporter('jshint-stylish'))
                .pipe(gulpif(useFailReporter, jshint.reporter('fail')));
        });

    },

    isBundleValidForTask: function (bundle) {
        return bundle && bundle.hasFilesJs();
    }
});
