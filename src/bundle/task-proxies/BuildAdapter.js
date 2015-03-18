/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
'use strict';

require('sjljs');

// Import base task adapter to extend
var TaskAdapter = require('../TaskAdapter');

module.exports = TaskAdapter.extend(function BuildAdapter () {
    TaskAdapter.apply(this, arguments);
}, {

    registerBundle: function (bundle, gulp, wrangler) {
        var self = this,
            bundleName = bundle.options.alias,
            taskName = 'build:' + bundleName,
            targets, deps;

        if (!self.isBundleValidForTask(bundle)) {
            return;
        }

        targets = self.getTasksForBundle(bundle, wrangler);

        deps = self.getPrelimTasksForBundle(bundle, wrangler, targets.targets);

        wrangler.registerTasksForBundle(gulp, bundle, targets.taskAliases);

        targets = targets.targets.filter(function (task) {
            return deps.indexOf(task) === -1;
        });

        self.registerGulpTasks(taskName, targets, gulp, wrangler, deps);

    }, // end of `registerBundle`

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            targets = [],
            data,
            deps;

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            data = self.getTasksForBundle(bundle, wrangler);

            deps = self.getPrelimTasksForBundle(bundle, wrangler, data.targets);

            wrangler.registerTasksForBundle(gulp, bundle, data.taskAliases);
            targets = targets.concat(data.targets);
        });

        targets = targets.filter(function (task) {
            return deps.indexOf(task) === -1;
        });

        self.registerGulpTasks('build', targets, gulp, wrangler, deps);
    },

    isBundleValidForTask: function (bundle) {
        return bundle && (bundle.has('files') || bundle.has('requirejs') || bundle.has('browserify'));
    },

    isBundleValidForMinifyAndConcat: function (bundle) {
        return bundle && (bundle.has('files.js') || bundle.has('files.css')
            || bundle.has('files.html') || bundle.has('files.html'));
    },

    getPrelimTasksForBundle: function (bundle, wrangler, tasks) {
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

    getTasksForBundle: function (bundle) {
        var wrangler = this.wrangler,
            bundleName = bundle.options.alias,
            targets = [],
            taskAliases = [],
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

            // Capture task name for output
            taskAliases.push(task);

            // Push task to run later
            targets.push(task + ':' + bundleName);
        });

        // If bundle has minifiable or concatable sources build
        if (isBundleValidForMinAndConcat) {
            taskAliases.push('minify');
            targets.push('minify:' + bundleName);
        }

        if (bundle.has('requirejs')) {
            taskAliases.push('requirejs');
            targets.push('requirejs:' + bundleName);
        }

        return {targets: targets, taskAliases: taskAliases};
    }

}); // end of export