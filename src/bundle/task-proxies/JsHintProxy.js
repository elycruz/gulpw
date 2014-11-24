/**
 * Created by edelacruz on 10/8/2014.
 */
require('sjljs');

// Import base task proxy to extend
var gulpif = require('gulp-if'),
    jshint = require('gulp-jshint'),
    TaskProxy = require('../TaskProxy');

module.exports = TaskProxy.extend("JsHintProxy", {

    /**
     *
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

        // Task string separator
        var self = this,

            separator = wrangler.getTaskStrSeparator(),

            jsHintConfig = self.getTaskConfig(wrangler.tasks.jshint) || {},

            useFailReporter = false;

        if (!bundle || !bundle.hasFilesJs()) {
            return;
        }

        gulp.task('jshint' + separator + bundle.options.name, function () {

            gulp.src(bundle.options.files.js)

                .pipe(jshint(jsHintConfig))

                .pipe(jshint.reporter('jshint-stylish'))

                .pipe(gulpif(useFailReporter, jshint.reporter('fail')));
        });

    }, // end of `registerBundle`

    getTaskConfig: function (config) {
        // @todo if using config file (.jshintrc etc.) file load it here
        return config.options;
    }
});
