/**
 * Created by edelacruz on 10/8/2014.
 */

'use strict';

require('sjljs');

var jshint = require('gulp-jshint'),
    duration = require('gulp-duration'),
    BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    path = require('path'),
    chalk = require('chalk'),
    lazypipe = require('lazypipe');

module.exports = BaseBundleTaskAdapter.extend('JsHintAdapter', {

    registerBundle: function (bundle, gulp, wrangler) {
        var self = this,
            taskName = 'jshint:' + bundle.options.alias,
            filesToExclude = wrangler.tasks.jshint.ignoredFiles,
            src = self.getTargetsForBundle(bundle, wrangler);

        if (filesToExclude && Array.isArray(filesToExclude)) {
            src = src.filter(function (item) {
                return filesToExclude.indexOf(path.basename(item)) === -1;
            });
        }

        gulp.task(taskName, function () {
            console.log(chalk.cyan('Running "' + taskName + '"\n'));
            return gulp.src(src)
                .pipe(self.getPipe(bundle, gulp, wrangler)());
        });

    },

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            targets = [];
        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            self.registerBundle(bundle, gulp, wrangler);
            targets.push('jshint:' + bundle.options.alias);
        });
        self.registerGulpTasks('jshint', targets, gulp, wrangler);
    },

    getTargetsForBundle: function (bundle/*, wrangler*/) {
        var targets = [];
        if (bundle.has('files.js')) {
            targets = targets.concat(bundle.options.files.js);
        }
        if (bundle.has('requirejs')) {
            if (bundle.options.requirejs.options.dir) {
                targets.push(path.join(bundle.options.requirejs.options.dir, '**/*.js'));
            }
            else {
                targets.push(bundle.options.requirejs.options.out);
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
            jsHintConfig = wrangler.tasks.jshint.jshintrc || wrangler.tasks.jshint.options,
            useFailReporter = false;

        if (sjl.empty(self.pipe)) {
            self.pipe = lazypipe()
                //.pipe(callback, function (file, enc, cb) {
                //    console.log(chalk.grey('Linting: ' + file.path));
                //    return cb ? cb() : file;
                //})
                .pipe(jshint, jsHintConfig)
                .pipe(duration, chalk.cyan('jshint \"' + bundle.options.alias + '\' duration'))
                .pipe(jshint.reporter, 'jshint-stylish');

            if (useFailReporter) {
                self.pipe.pipe(jshint.reporter, 'fail');
            }
        }
        return self.pipe;
    }

});
