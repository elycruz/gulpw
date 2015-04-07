/**
 * Created by edelacruz on 10/8/2014.
 */

'use strict';

require('sjljs');


var jasmine = require('gulp-jasmine'),
    duration = require('gulp-duration'),
    BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    fncallback = require('gulp-fncallback'),
    chalk = require('chalk');

module.exports = BaseBundleTaskAdapter.extend('JasmineAdapter', {

    registerGulpTask: function (taskName, gulp, bundle, wrangler) {
        var taskConfig = sjl.extend(true,
                JSON.parse(JSON.stringify(wrangler.tasks.jasmine)), bundle.options.jasmine),
            jasmineOptions = taskConfig.options,
            skipTests = wrangler.skipTesting() || wrangler.skipJasmineTesting();

        gulp.task(taskName, function () {
            return (new Promise(function (fulfill, reject) {
                if (skipTests) {
                    wrangler.log(chalk.grey('\nSkipping jasmine tests.'), '--mandatory');
                    return fulfill();
                }
                wrangler.log(chalk.cyan('\n  Running "' + taskName + '":'), '--mandatory');
                gulp.src(taskConfig.files)
                    .pipe(jasmine(jasmineOptions))
                    .pipe(duration(chalk.cyan('jasmine \"' + bundle.options.alias + '\' duration')))
                    .pipe(fncallback(function () {
                            fulfill();
                        }));
            }));
        });

    },

    /**
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {
        var self = this;
        if (!self.isBundleValidForTask(bundle)) {
            return;
        }
        this.registerGulpTask('jasmine:' + bundle.options.alias, gulp, bundle, wrangler);
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
                wrangler.log(chalk.grey('\nSkipping jasmine tests.'), '--mandatory');
                return Promise.resolve();
            }
            wrangler.log('\n  Running "jasmine" task(s):', '--mandatory');
            return wrangler.launchTasks(tasks, gulp);
        });
    },

    isBundleValidForTask: function (bundle) {
        return bundle && bundle.has('jasmine');
    }
});
