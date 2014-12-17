/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
"use strict"; require("sjljs");

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    chalk = require('chalk');

module.exports = TaskProxy.extend("BuildProxy", {

    registerBundle: function (bundle, gulp, wrangler) {
        // Task string separator
        var separator = wrangler.getTaskStrSeparator(),
            self = this,
            bundleName = bundle.options.alias,
            taskName = 'build' + separator + bundleName,
            targets;

        if (!self.isBundleValidForTask(bundle)) {
            return; // @todo log message/warning here
        }

        targets = self.getTasksForBundle(bundle, wrangler);

        self.registerGulpTasks(taskName, targets, gulp, wrangler);

        //wrangler.log('BuildProxy -> targets: ', targets, '--debug');

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
       return bundle && (bundle.has('files.js') || bundle.has('files.css') || bundle.has('files.html') || bundle.has('files.html'));
    },

    getTasksForBundle: function (bundle, wrangler) {
        var self = this,
            separator = wrangler.getTaskStrSeparator(),
            bundleName = bundle.options.alias,
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

            //wrangler.log('BuildProxy -> Ignore Task "' + task + '"? ', ignoreTask, '--debug');

            // If it is not ok to push the current `task` in the loop to the return value bail
            if (sjl.empty(bundle.options[task])
                || ignoredTasks.indexOf(task) > -1
                || ignoreTask) {
                return;
            }

            // Push task to run later
            targets.push(task + separator + bundleName);
        });

        //wrangler.log('\nwrangler.skipLinting: ' + wrangler.skipLinting(),
        //    '\nwrangler.skipCssLinting: ' + wrangler.skipCssLinting(),
        //    '\nwrangler.skipJsLinting: ' + wrangler.skipJsLinting(),
        //    '\nlintBeforeBuild: ' + self.lintBeforeBuild, '--debug');

        // Add linting/hinting tasks if necessary
        if (wrangler.tasks.build.lintBeforeBuild && !wrangler.skipLinting()) {

            // Add jshint task if `files.js`, `requirejs` or `browserify` key exists on `bundle`
            if ((bundle.has('files.js') || bundle.has('requirejs') || bundle.has('browserify')) && !wrangler.skipJsLinting()) {
                targets.push('jshint' + separator + bundleName);
            }

            // Add css lint task if necessary
            if ((bundle.has('files.css') || bundle.has('compass')) && !wrangler.skipCssLinting()) {
                targets.push('csslint' + separator + bundleName);
            }
        }
        else {
            wrangler.log(chalk.grey('   Skipping lint/hint registration for bundle "' + bundleName + '".'), '--mandatory');
        }

        // If bundle has minifiable or concatable sources build
        if (isBundleValidForMinAndConcat) {
            targets.push('minify' + separator + bundleName);
        }

        return targets;
    }

}); // end of export
