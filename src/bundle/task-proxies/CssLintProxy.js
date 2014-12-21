/**
 * Created by edelacruz on 10/8/2014.
 */
/**
 * Created by edelacruz on 10/8/2014.
 */
"use strict"; require("sjljs");

var csslint = require('gulp-csslint'),
    chalk = require('chalk'),
    duration = require('gulp-duration'),
    TaskProxy = require('../TaskProxy'),
    lazypipe = require('lazypipe');

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
            cssLintPipe = self.getPipe(bundle, gulp, wrangler);

        if (!self.isBundleValidForTask(bundle)) {
            return;
        }

        gulp.task('csslint' + separator + bundle.options.alias, function () {

            gulp.src(bundle.options.files.css)

                .pipe(cssLintPipe());
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
        return bundle && bundle.has('files.css');
    },

    getPipe: function (bundle, gulp, wrangler) {
        var self = this,
            cssLintConfig = wrangler.tasks.csslint.options;

        if (sjl.empty(self.pipe)) {
            self.pipe = lazypipe()
                .pipe(duration, 'csslint "' + bundle.options.alias + '" duration')
                .pipe(csslint, cssLintConfig)
                .pipe(csslint.reporter);

        }
        return self.pipe;
    }
});
