/**
 * Created by Ely on 1/27/2015.
 */
/**
 * Created by edelacruz on 10/8/2014.
 */

'use strict';

require('sjljs');

require('es6-promise').polyfill();

var duration = require('gulp-duration'),
    TaskAdapter = require('../TaskAdapter'),
    chalk = require('chalk');

module.exports = TaskAdapter.extend(function DevelopAdapter (config) {
    TaskAdapter.call(this, config);
}, {

    registerGulpTask: function (taskName, gulp, bundle, wrangler) {
        //gulp.task(taskName, function () {
        //    return (new Promise(function (fulfill, reject) {
        //        wrangler.launchTasks(['watch:' + bundle.options.alias], gulp).then(function () { fulfill(); });
        //    }));
        //});
    },

    registerBundle: function (bundle, gulp, wrangler) {
        //var self = this;
        //if (!self.isBundleValidForTask(bundle)) {
        //    return;
        //}
        //this.registerGulpTask('jasmine:' + bundle.options.alias, gulp, bundle, wrangler);
    },

    registerBundles: function (bundles, gulp, wrangler) {
        //var self = this,
        //    taskName,
        //    tasks = [],
        //    skipTests = wrangler.skipTesting() || wrangler.skipJasmineTesting();
        //
        //bundles.forEach(function (bundle) {
        //    if (!self.isBundleValidForTask(bundle)) {
        //        return;
        //    }
        //    taskName = 'jasmine:' + bundle.options.alias;
        //    tasks.push(taskName);
        //});
        //
        //gulp.task('jasmine', function () {
        //    if (skipTests) {
        //        wrangler.log(chalk.grey('\nSkipping jasmine tests.'), '--mandatory');
        //        return Promise.resolve();
        //    }
        //    wrangler.log('\n  Running "jasmine" task(s):', '--mandatory');
        //    return wrangler.launchTasks(tasks, gulp);
        //});
    },

    isBundleValidForTask: function (bundle) {
        //return bundle && bundle.has('alias');
    }
});
