/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
'use strict';

require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy');

module.exports = TaskProxy.extend('AllTasksProxy', {

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            tasks = [],
            tasksList = wrangler.tasks.all.tasks;

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            tasksList.forEach(function (task) {
                if (task === 'build' && self.isBundleValidForBuildTask(bundle)) {
                    tasks.push(task + ':' + bundle.options.alias);
                }
                else if (task === 'deploy' && self.isBundleValidForDeployTask(bundle)) {
                    tasks.push(task + ':' + bundle.options.alias);
                }
                else if (task !== 'deploy' && task !== 'build') {
                    tasks.push(task + ':' + bundle.options.alias);
                }
            });
        });

        gulp.task('all', function () {
            self.launchTasks(tasks, gulp, wrangler);
        });
    },

    isBundleValidForTask: function (bundle) {
        return this.isBundleValidForBuildTask(bundle) || this.isBundleValidForDeployTask(bundle);
    },

    isBundleValidForBuildTask: function (bundle) {
        return bundle && (bundle.has('files') || bundle.has('requirejs') || bundle.has('browserify'));
    },

    isBundleValidForDeployTask: function (bundle) {
        return bundle && bundle.has('deploy.otherFiles');
    }

}); // end of export
