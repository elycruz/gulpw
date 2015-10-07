/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
'use strict';

require('sjljs');

// Import base task adapter to extend
var BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter');

module.exports = BaseBundleTaskAdapter.extend(function BuildAdapter () {
    BaseBundleTaskAdapter.apply(this, sjl.argsToArray(arguments));
}, {

    registerBundle: function (bundle, gulp, wrangler) {
        var self = this,
            bundleName = bundle.options.alias,
            taskName = 'build:' + bundleName,
            targets,
            deps = [];

        targets = self.getTasksForBundle(bundle, wrangler);

        // Register related bundles
        if (bundle.has('relatedBundles.processBefore')) {
            wrangler.getBundles(bundle.options.relatedBundles.processBefore).forEach(function (item) {
                if (!self.isBundleValidForTask(item)) {
                    return;
                }
                deps.push('build:' + item.options.alias);
                self.registerBundle(item, gulp, wrangler);
            });
        }

        wrangler.registerTasksForBundle(gulp, bundle, targets.taskAliases);

        self.registerGulpTasks(taskName, targets.targets, gulp, wrangler, deps);

    }, // end of `registerBundle`

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            targets = [],
            data;

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            data = self.getTasksForBundle(bundle, wrangler);

            wrangler.registerTasksForBundle(gulp, bundle, data.taskAliases);
            targets = targets.concat(data.targets);
        });

        self.registerGulpTasks('build', targets, gulp, wrangler);
    },

    isBundleValidForTask: function (bundle) {
        return bundle && (bundle.has('files')
            || bundle.has('requirejs')
            || bundle.has('browserify')
            || bundle.has('vulcan'));
    },

    isBundleValidForMinifyAndConcat: function (bundle) {
        return bundle && (bundle.has('files.js') || bundle.has('files.css')
            || bundle.has('files.html') || bundle.has('files.html'))
            &&  sjl.empty(this.wrangler.tasks.minify.notConfiguredByUser);
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
