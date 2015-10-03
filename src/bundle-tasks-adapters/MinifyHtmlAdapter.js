/**
 * Created by elydelacruz on 10/3/15.
 */
/**
 * Created by elydelacruz on 10/3/15.
 */

'use strict';

require('sjljs');

var fs = require('fs'),
    csslint = require('gulp-csslint'),
    chalk = require('chalk'),
    duration = require('gulp-duration'),
    path = require('path'),
    callback = require('gulp-fncallback'),
    BasicGulpModuleAdapter = require('./BasicGulpModuleAdapter'),
    lazypipe = require('lazypipe');

module.exports = BasicGulpModuleAdapter.extend(function MinifyHtmlAdapter(/*options*/) {
    BasicGulpModuleAdapter.apply(this, arguments);
}, {

    registerBundle: function (bundle, gulp, wrangler) {

        // Task string separator
        var self = this,
            cssLintPipe = self.getPipe(bundle, gulp, wrangler);

        gulp.task('csslint:' + bundle.options.alias, function () {
            return gulp.src(bundle.options.files.css)
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
            self.registerBundle(bundle, gulp, wrangler);
            targets = targets.concat(bundle.options.files.css);
        });

        gulp.task('csslint', function () {
            wrangler.log(chalk.cyan(' Running "csslint" task(s).  Task messages below:\n'));
            return gulp.src(targets)
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
            minifyHtmlOptions;
        if (sjl.empty(self.pipe)) {
            self.pipe = lazypipe()
                .pipe(minifyHtml, self.getOptions(bundle));
        }

        return self.pipe;
    }
});
