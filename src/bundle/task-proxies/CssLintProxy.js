/**
 * Created by edelacruz on 10/8/2014.
 */
/**
 * Created by edelacruz on 10/8/2014.
 */
require('sjljs');

var csslint = require('gulp-csslint'),
    chalk = require('chalk'),
    duration = require('gulp-duration'),
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

            cssLintConfig = wrangler.tasks.csslint.options;

        if (!self.isBundleValidForTask(bundle)) {
            return;
        }

        gulp.task('csslint' + separator + bundle.options.name, function () {

            gulp.src(bundle.options.files.css)

                .pipe(duration('csslint "' + bundle.options.name + '" duration'))

                .pipe(csslint(cssLintConfig))

                .pipe(csslint.reporter());
        });

    }, // end of `registerBundle`

    registerBundles: function (bundles, gulp, wrangler) {
        // Task string separator
        var self = this,
            cssLintConfig = wrangler.tasks.csslint.options,
            targets = [];

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            targets = targets.concat(bundle.options.files.css);
        });

        gulp.task('csslint', function () {
            gulp.src(targets)
                .pipe(duration(chalk.cyan('csslint "all bundles" duration')))
                .pipe(csslint(cssLintConfig))
                .pipe(csslint.reporter());
        });
    },

    isBundleValidForTask: function (bundle) {
        return bundle && bundle.hasFilesCss();
    }
});
