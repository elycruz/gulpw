/**
 * Created by edelacruz on 10/8/2014.
 */

'use strict';

require('sjljs');

var jasmine = require('gulp-jasmine'),
    duration = require('gulp-duration'),
    TaskProxy = require('../TaskProxy'),
    chalk = require('chalk');

module.exports = TaskProxy.extend('JasmineProxy', {

    registerGulpTask: function (taskName, gulp, bundle, wrangler) {
        var taskConfig = sjl.extend(true,
                JSON.parse(JSON.stringify(wrangler.tasks.jasmine)), bundle.options.jasmine),
            jasmineOptions = taskConfig.options;

        gulp.task(taskName, function () {
            wrangler.log(chalk.cyan('\n  Running "' + taskName + '":'), '--mandatory');
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
        var self = this;
        if (!self.isBundleValidForTask(bundle)) {
            return;
        }
        this.registerGulpTask('jasmine:' + bundle.options.alias, gulp, bundle, wrangler);
    },

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            taskName,
            tasks = [];

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            taskName = 'jasmine:' + bundle.options.alias;
            self.registerGulpTask(taskName, gulp, bundle, wrangler);
            tasks.push(taskName);
        });

        gulp.task('jasmine', function () {
            wrangler.log('\n  Running "jasmine" task(s):', '--mandatory');
            wrangler.launchTasks(tasks, gulp);
        });
    },

    isBundleValidForTask: function (bundle) {
        return bundle && bundle.has('jasmine');
    }
});
