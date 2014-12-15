/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
"use strict"; require("sjljs");

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    chalk = require('chalk'),
    path = require('path');

module.exports = TaskProxy.extend("DeployProxy", {

    registerGulpTask: function (taskName, targets, gulp, wrangler, tasks) {
        var tasks,
            watchInterval = null;

        // If no tasks or targets bail
        if (sjl.empty(tasks) || sjl.empty(targets)) {
            return;
        }

        gulp.task(taskName, function () {

            console.log('\nWatching for changes...');

            gulp.watch(targets, function (event) {

                var doneTaskCount = 0,
                    deployTasksLaunched = false,
                    fileShortPath = event.path,
                    otherTasks,
                    deployTasks,
                    rawTaskKeys;

                wrangler.log('\n', chalk.dim('File change detected at ' + fileShortPath + ';'));
                wrangler.log('Change type: ' + event.type + ';');
                wrangler.log(chalk.dim('Running tasks sub tasks...'), '--mandatory');

                // Get deploy tasks
                deployTasks = tasks.filter(function (task) {
                    return task.indexOf('deploy') > -1;
                });

                tasks = tasks.filter(function (task) {
                    return task.indexOf('deploy') === - 1;
                });

                // Launch all tasks except for deploy tasks
                wrangler.launchTasks(tasks, gulp);

                rawTaskKeys = Object.keys(gulp.tasks);

                // Get deploy tasks
                deployTasks = deployTasks.concat(rawTaskKeys.filter(function (task) {
                    return task.indexOf('deploy') > -1;
                }));

                // Get deploy tasks
                otherTasks = rawTaskKeys.filter(function (task) {
                    return task.indexOf('deploy') === -1;
                });

                if (watchInterval !== null) {
                    clearInterval(watchInterval);
                }

                deployTasks = deployTasks.filter(function (item, i, list) {
                    return list.indexOf(item) === i;
                });

                watchInterval = setInterval(function () {
                    var hasDeployTasks = deployTasks.length > 0,
                        otherTasksComplete = doneTaskCount === otherTasks.length,
                        deployTasksComplete = (doneTaskCount + otherTasks.length)
                            >= (otherTasks.length + deployTasks.length);

                    if (!otherTasksComplete && doneTaskCount < otherTasks.length) {
                        otherTasks.forEach(function (key) {
                            if (gulp.tasks[key].done === true) {
                                doneTaskCount += 1;
                            }
                        });
                    }

                    else if (otherTasksComplete && !hasDeployTasks) {
                        console.log(chalk.cyan('\nBuild completed.'));
                        clearInterval(watchInterval);
                    }

                    else if (otherTasksComplete && hasDeployTasks) {
                        console.log(chalk.cyan('\nBuild completed.'));
                    }

                    console.log(hasDeployTasks, deployTasksComplete,
                        deployTasksLaunched, otherTasksComplete, otherTasks.length, doneTaskCount,
                    otherTasks, deployTasks);

                    if (hasDeployTasks) {

                        if (!deployTasksComplete && !deployTasksLaunched && otherTasksComplete) {
                            wrangler.log('DEPLOY.');

                            console.log(deployTasks);

                            // Launch any `deploy` tasks that may have been defined
                            wrangler.launchTasks(deployTasks, gulp);

                            deployTasksLaunched = true;
                        }
                        else if (deployTasksComplete) {
                            clearInterval(watchInterval);
                        }

                        deployTasks.forEach(function (key) {
                            if (gulp.tasks[key].done === true) {
                                doneTaskCount += 1;
                            }
                        });
                    }

                }, 1000);

                console.log(gulp);

            });
        });
    },

    /**
     *
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {
        // Task string separator
        var separator = wrangler.getTaskStrSeparator(),
            bundleName = bundle.options.alias,
            self = this,
            targets,
            tasks;

        if (!self.isBundleValidForTask(bundle)) {
            return; // @todo log message/warning here
        }

        targets = self.getSrcForBundle(bundle);

        tasks = self.getTasksForBundle(bundle, wrangler.tasks.watch.tasks, wrangler);

        self.registerGulpTask('watch' + separator + bundleName, targets,
            gulp, wrangler, tasks);

    }, // end of `registerBundle`

    /**
     *
     * @param bundles {Array<Bundle>}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            targets = [],
            tasks = [];

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return; // @todo log message/warning here
            }
            targets = targets.concat(self.getSrcForBundle(bundle));
            tasks = tasks.concat(self.getTasksForBundle(bundle, wrangler.tasks.watch.tasks));
        });

        self.registerGulpTask('watch', targets, gulp, wrangler, tasks);

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
                targets = Array.isArray(keyVal) ? targets.concat(keyVal) :
                    (!sjl.empty(keyVal) ? targets.push(keyVal) : targets);
            });
        }

        if (bundle.has('requirejs')) {
            targets.push(path.join(bundle.options.requirejs.options.appDir,
                bundle.options.requirejs.options.baseUrl) + path.sep + '**/*');
        }

        return targets;
    },

    isBundleValidForTask: function (bundle) {
        return bundle && (bundle.has('files') || bundle.has('requirejs')
            || bundle.has('browserify') || bundle.has('watch'));
    }

}); // end of export
