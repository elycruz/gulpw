/**
 * Created by Ely on 4/6/2015.
 */
/**
 * Created by edelacruz on 10/8/2014.
 */
'use strict'; require('sjljs');

// Import base task proxy to extend
var
    eslint = require('gulp-eslint'),
    duration = require('gulp-duration'),
    BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    path = require('path'),
    chalk = require('chalk'),
    lazypipe = require('lazypipe');

module.exports = BaseBundleTaskAdapter.extend('EsLintAdapter', {

    registerBundle: function (bundle, gulp, wrangler) {

        // Task string separator
        var self = this,
            taskName = 'eslint:' + bundle.options.alias;

        if (!self.isBundleValidForTask(bundle)) {
            return;
        }

        gulp.task(taskName, function () {

            console.log(chalk.cyan('Running "' + taskName + '"\n.'));

            return gulp.src(self.getTargetsForBundle(bundle, wrangler))

                // Get prebuilt pipe
                .pipe(self.getPipe(bundle, gulp, wrangler)());
        });

    }, // end of `registerBundle`

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            targets = [];
        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            self.registerBundle(bundle, gulp, wrangler);
            targets = self.getTasksForBundle(bundle, ['eslint'], wrangler).concat(targets);
        });
        self.registerGulpTasks('eslint', targets, gulp, wrangler);
    },

    getTargetsForBundle: function (bundle/*, wrangler*/) {
        var targets = [];
        if (bundle.has('files.js')) {
            targets = targets.concat(bundle.options.files.js);
        }
        // @todo Allow both use of appdir and dir for requirejs resources eslint
        if (bundle.has('requirejs')) {
            if (bundle.options.requirejs.options.dir) {
                targets.push(path.join(bundle.options.requirejs.options.dir, '**/*.js'));
            }
            else {
                targets.push(path.join(bundle.options.requirejs.options.out, '**/*.js'));
            }
        }
        // @todo If bundle has browserify
        return targets;
    },

    isBundleValidForTask: function (bundle) {
        return bundle && (bundle.has('files.js') || bundle.has('requirejs') || bundle.has('browserify'));
    },

    getPipe: function (bundle, gulp, wrangler) {
        var self = this,
            esLintSection = wrangler.tasks.eslint,
            esLintConfig = esLintSection.options,
            failOnError = esLintSection.failOnError,
            failAfterError = esLintSection.failAfterError;

        if (sjl.empty(self.pipe)) {
            self.pipe = lazypipe()
                //.pipe(callback, function (file, enc, cb) {
                //    console.log(chalk.grey('Linting: ' + file.path));
                //    return cb ? cb() : file;
                //})
                .pipe(eslint, esLintConfig)
                .pipe(duration, chalk.cyan('eslint \"' + bundle.options.alias + '\' duration'))
                .pipe(eslint.format, 'stylish');

            if (failAfterError) {
                self.pipe.pipe(eslint.failAfterError);
            }
            else if (failOnError) {
                self.pipe.pipe(eslint.failOnError);
            }
        }

        return self.pipe;
    }

});
