/**
 * Created by edelacruz on 10/8/2014.
 */

'use strict';

require('sjljs');


var jasmine = require('gulp-jasmine'),
    duration = require('gulp-duration'),
    BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    chalk = require('chalk');

module.exports = BaseBundleTaskAdapter.extend(function JasmineAdapter () {}, {

    registerGulpTask: function (taskName, gulp, bundle, wrangler) {
        var taskConfig = sjl.extend(true, JSON.parse(JSON.stringify(wrangler.tasks.jasmine)), bundle.options.jasmine),
            jasmineOptions = taskConfig.options,
            skipTests = wrangler.skipTesting() || wrangler.skipJasmineTesting();

        gulp.task(taskName, function () {
            if (skipTests) {
                wrangler.log(chalk.grey('Skipping jasmine tests.\n'), '--mandatory');
                return Promise.resolve();
            }
            wrangler.log(chalk.cyan('Running "' + taskName + '":\n'), '--mandatory');
            return gulp.src(taskConfig.files)
                .pipe(jasmine(jasmineOptions))
                .pipe(duration(chalk.cyan('jasmine \"' + bundle.options.alias + '\' duration')));
        });
    },

    /**
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {
        this.registerGulpTask('jasmine:' + bundle.options.alias, gulp, bundle, wrangler);
        return true;
    },

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            taskName,
            tasks = [],
            skipTests = wrangler.skipTesting() || wrangler.skipJasmineTesting();

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            taskName = 'jasmine:' + bundle.options.alias;
            self.registerBundle(bundle, gulp, wrangler);
            tasks.push(taskName);
        });

        gulp.task('jasmine', function () {
            if (skipTests) {
                console.log(chalk.grey('Skipping jasmine tests.\n'));
                return Promise.resolve();
            }
            console.log('Running "jasmine" task(s):\n');
            return wrangler.launchTasks(tasks, gulp);
        });
    },

    isBundleValidForTask: function (bundle) {
        return bundle && bundle.has('jasmine');
    }
});
