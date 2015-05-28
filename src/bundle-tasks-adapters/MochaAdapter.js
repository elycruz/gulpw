/**
 * Created by edelacruz on 10/8/2014.
 */

'use strict';

require('sjljs');


var mocha = require('gulp-mocha'),
    duration = require('gulp-duration'),
    TaskAdapter = require('./BaseBundleTaskAdapter'),
    fncallback = require('gulp-fncallback'),
    chalk = require('chalk');

module.exports = TaskAdapter.extend('MochaAdapter', {

    registerGulpTask: function (taskName, gulp, bundle, wrangler) {
        var taskConfig = sjl.extend(true,
                JSON.parse(JSON.stringify(wrangler.tasks.mocha)), bundle.options.mocha),
            mochaOptions = taskConfig.options,
            skipTests = wrangler.skipTesting() || wrangler.skipMochaTesting();

        gulp.task(taskName, function () {
            if (skipTests) {
                wrangler.log(chalk.grey('Skipping mocha tests.\n'), '--mandatory');
                return Promise.resolve();
            }
            wrangler.log(chalk.cyan('Running "' + taskName + '":\n'), '--mandatory');
            return gulp.src(taskConfig.files)
                .pipe(mocha(mochaOptions))
                .pipe(duration(chalk.cyan('mocha \"' + bundle.options.alias + '\' duration')));
        });
    },

    registerBundle: function (bundle, gulp, wrangler) {
        this.registerGulpTask('mocha:' + bundle.options.alias, gulp, bundle, wrangler);
    },

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            taskName,
            tasks = [],
            skipTests = wrangler.skipTesting() || wrangler.skipMochaTesting();

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            taskName = 'mocha:' + bundle.options.alias;
            self.registerGulpTask(taskName, gulp, bundle, wrangler);
            tasks.push(taskName);
        });

        gulp.task('mocha', function () {
            if (skipTests) {
                console.log(chalk.grey('Skipping mocha tests.\n'));
                return Promise.resolve();
            }
            console.log('Running "mocha" task(s):\n');
            return wrangler.launchTasks(tasks, gulp);
        });
    },

    isBundleValidForTask: function (bundle) {
        return bundle && bundle.has('mocha');
    }
});
