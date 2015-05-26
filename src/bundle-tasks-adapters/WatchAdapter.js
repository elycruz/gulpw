/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var TaskAdapter = require('./BaseBundleTaskAdapter'),
    chalk = require('chalk'),
    path = require('path');

module.exports = TaskAdapter.extend(function WatchAdapter () {
    TaskAdapter.apply(this, arguments);
}, {

    registerGulpTask: function (taskName, targets, gulp, wrangler, bundle, tasks) {

        // If no tasks or targets bail
        if (sjl.empty(tasks) || sjl.empty(targets)) {
            return;
        }

        gulp.task(taskName, function () {

            return (new Promise(function (fulfill, reject) {

                var waitingMessage = 'Watching for changes...';

                console.log(waitingMessage + '\n');

                gulp.watch(targets, function (event) {
                    var fileShortPath = path.relative(process.cwd(), '.' + path.sep + event.path),
                        catchFunc = function (reason) {
                            console.log(reason + '\n');
                            reject(reason);
                        };

                    console.log(chalk.dim('File change detected at ' + fileShortPath + ';\n'));
                    console.log('Change type: ' + event.type + ';\n');
                    console.log(chalk.dim('Running sub tasks...\n'));

                    // Return launch promise (es6 Promise sweetness -> this script went from over 60 lines to 14 lines!)
                    // ----
                    // Run all task that are not deploy tasks first
                    return wrangler.launchTasks(tasks.filter(function (task) {
                        return task.indexOf('deploy') === -1;
                    }), gulp)

                    // On promise fulfillment..
                    .then(function () {
                        var deployTasks = tasks.filter(function (task) {
                            return task.indexOf('deploy')  > -1;
                        });

                        if (deployTasks.length === -1) {
                            console.log(waitingMessage + '\n');
                            fulfill();
                            return;
                        }

                        // Run all deploy tasks
                        return wrangler.launchTasks(deployTasks, gulp)
                            .then(function () {
                                console.log(waitingMessage + '\n');
                                fulfill();
                            })

                            // Catch any promise rejections
                            .catch(catchFunc);
                    })

                    // Catch any promise rejections
                    .catch(catchFunc);

                }); // end of watch call

            })); // end of promise

        }); // end of overall task

    }, // end of register

    registerBundle: function (bundle, gulp, wrangler) {
        var self = this,
            targets,
            tasks;

        // Register bundle with tasks
        wrangler.registerTasksForBundle(gulp, bundle, wrangler.tasks.watch.tasks);

        // Get targets ({bundle}:{task})
        targets = self.getSrcForBundle(bundle);

        // Watch the bundle file for changes (restart the watch task on bundle file changes)
        targets.push(bundle.get('filePath'));

        // Get tasks to run
        tasks = self.getTasksForBundle(bundle, wrangler.tasks.watch.tasks, wrangler);

        // Register watch task
        self.registerGulpTask(self.getTaskNameForBundle(bundle), targets,
            gulp, wrangler, bundle, tasks);

    }, // end of `registerBundle`

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            targets = [],
            tasks = [];

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            targets = targets.concat(self.getSrcForBundle(bundle));
            tasks = tasks.concat(self.getTasksForBundle(bundle, wrangler.tasks.watch.tasks));
            wrangler.registerTasksForBundle(gulp, bundle,wrangler.tasks.watch.tasks);
        });

        self.registerGulpTask('watch', targets, gulp, wrangler, bundles, tasks);

    }, // end of `registerBundles`

    getSrcForBundle: function (bundle) {
        var targets = [];

        // Bail if bundle is not valid for task
        if (!this.isBundleValidForTask(bundle)) {
            return targets;
        }

        // Merge other files to watch to targets
        if (bundle.has('watch') && Array.isArray(bundle.options.otherFiles)) {
            targets = targets.concat(bundle.options.watch.otherFiles);
        }

        // Merge all arrays in files key to `targets`
        // @todo ommit files in `pre-artifact` folder if it is being used.
        if (bundle.has('files')) {
            Object.keys(bundle.options.files).forEach(function (key) {
                var keyVal = bundle.options.files[key];
                if (Array.isArray(keyVal)) {
                    targets = targets.concat(keyVal);
                }
                else if (!sjl.empty(keyVal)) {
                    targets.push(keyVal);
                }
            });
        }

        if (bundle.has('requirejs')) {
            if (!sjl.empty(bundle.options.requirejs.options.appDir)) {
                targets.push(path.join(bundle.options.requirejs.options.appDir,
                    bundle.options.requirejs.options.baseUrl) + path.sep + '**/*');
            }
            else if (!sjl.empty(bundle.options.requirejs.options.baseUrl)) {
                targets.push(bundle.options.requirejs.options.baseUrl + path.sep + '**' + path.sep + '*');
            }
        }

        //if (bundle.has('deploy.otherFiles')) {
        //    Object.keys(bundle.options.deploy.otherFiles).forEach(function (key) {
        //        var keyVal = bundle.options.deploy.otherFiles[key];
        //        targets = Array.isArray(keyVal) ? targets.concat(keyVal) :
        //            (!sjl.empty(keyVal) ? targets.push(keyVal) : targets);
        //    });
        //}

        return targets;
    },

    isBundleValidForTask: function (bundle) {
        return bundle && (bundle.has('files') || bundle.has('requirejs')
            || bundle.has('browserify') || bundle.has('watch') || bundle.has('deploy.otherFiles'));
    }

}); // end of export
