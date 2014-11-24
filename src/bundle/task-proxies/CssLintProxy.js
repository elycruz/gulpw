/**
 * Created by edelacruz on 10/8/2014.
 */
/**
 * Created by edelacruz on 10/8/2014.
 */
require('sjljs');

var csslint = require('gulp-csslint'),
    TaskProxy = require('../TaskProxy');

module.exports = TaskProxy.extend("CssLintProxy", {

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

            cssLintConfig = self.getTaskConfig(wrangler.tasks.csslint) || {};

        if (!bundle || !bundle.hasFilesCss()) {
            return;
        }

        gulp.task('csslint' + separator + bundle.options.name, function () {

            gulp.src(bundle.options.files.css)

                .pipe(csslint(cssLintConfig))

                .pipe(csslint.reporter());
        });

    }, // end of `registerBundle`

    getTaskConfig: function (config) {
        // @todo if using config file load it here
        return config.options;
    }
});
