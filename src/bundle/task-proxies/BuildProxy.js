/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
'use strict';

require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    chalk = require('chalk');

module.exports = TaskProxy.extend('BuildProxy', {

    registerBundle: function (bundle, gulp, wrangler) {
        // Task string separator
        var self = this,
            bundleName = bundle.options.alias,
            taskName = 'build:' + bundleName,
            targets, deps;

        if (!self.isBundleValidForTask(bundle)) {
            return;
        }

        targets = self.getTasksForBundle(bundle, wrangler);

        deps = self.getTaskDepsForBundle(bundle, wrangler, targets);

        targets = targets.filter(function (task) {
            return deps.indexOf(task) === false;
        });

        self.registerGulpTasks(taskName, targets, gulp, wrangler, deps);

    }, // end of `registerBundle`

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            targets = [];

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            targets = self.getTasksForBundle(bundle, wrangler).concat(targets);
        });

        self.registerGulpTasks('build', targets, gulp, wrangler);
    },

    isBundleValidForTask: function (bundle) {
        return bundle && (bundle.has('files') || bundle.has('requirejs') || bundle.has('browserify'));
    },

    isBundleValidForMinifyAndConcat: function (bundle) {
       return bundle && (bundle.has('files.js') || bundle.has('files.css')
           || bundle.has('files.html') || bundle.has('files.html'));
    },

    getTaskDepsForBundle: function (bundle, wrangler, tasks) {
        var deps = [],
            prelimTasks = wrangler.tasks.build.prelimTasks;

        if (!sjl.empty(prelimTasks)) {
            deps = tasks.filter(function (task) {
                return prelimTasks.filter(function (prelimTask) {
                    return task.indexOf(prelimTask) > -1;
                }).length > 0;
            });
        }

        return deps;
    },

    getTasksForBundle: function (bundle, wrangler) {
        var bundleName = bundle.options.alias,
            targets = [],
            ignoredTasks = wrangler.tasks.build.ignoredTasks,
            ignoreTask,
            isBundleValidForMinAndConcat = this.isBundleValidForMinifyAndConcat(bundle);

        // Loop through possible tasks in `wrangler.tasks` and register the `bundle` with the ones
        // it has defined
        Object.keys(wrangler.tasks).forEach(function (task) {

            // Do we need to ignore current `task`?
            ignoreTask = ignoredTasks.filter(function (ignoredTask) {
                    return task.indexOf(ignoredTask) > -1;
                }).length > 0;

            // If it is not ok to push the current `task` in the loop to the return value bail
            if (sjl.empty(bundle.options[task])
                || ignoredTasks.indexOf(task) > -1
                || ignoreTask) {
                return;
            }

            // Push task to run later
            targets.push(task + ':' + bundleName);
        });

        // If bundle has minifiable or concatable sources build
        if (isBundleValidForMinAndConcat) {
            targets.push('minify' + ':' + bundleName);
        }

        return targets;
    }

}); // end of export
