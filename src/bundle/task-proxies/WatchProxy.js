/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
'use strict'; require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    chalk = require('chalk'),
    //spawn = require('child_process').spawn,
    path = require('path');

module.exports = TaskProxy.extend(function WatchProxy () {
    TaskProxy.apply(this, sjl.argsToArray(arguments));
}, {

    registerGulpTask: function (taskName, targets, gulp, wrangler, bundle, tasks) {
        var watchInterval = null;
            //altTaskName = null,
            //childProcess;

        // If no tasks or targets bail
        if (sjl.empty(tasks) || sjl.empty(targets)) {
            return;
        }

        //if (taskName.indexOf(':') > -1) {
        //    altTaskName = 'W:' + taskName.split(':')[1];
        //}
        //
        //gulp.task(taskName, function () {
        //    if (childProcess) {
        //        childProcess.kill();
        //    }
        //    childProcess = spawn(taskName);
        //});

        //gulp.task(altTaskName, function () {
        gulp.task(taskName, function () {

            console.log('\nWatching for changes...');

            gulp.watch(targets, function (event) {

                var doneTaskCount = 0,
                    deployTasksLaunched = false,
                    fileShortPath = path.relative(process.cwd(), '.' + path.sep + event.path),
                    deployTasks,
                    otherTasks = [];

                //// If watched bundle yaml is the changed file
                //if (fileShortPath === bundle.options.filePath) {
                //    // Restart watch task
                //}

                //console.log(chalk.magenta('\nTasks that will be launched on file changes:\n'), tasks);

                wrangler.log('\n', chalk.dim('File change detected at ' + fileShortPath + ';'));
                wrangler.log('Change type: ' + event.type + ';');
                wrangler.log(chalk.dim('Running tasks sub tasks...'), '--mandatory');

                // Get deploy tasks
                deployTasks = tasks.filter(function (task) {
                    return task.indexOf('deploy') > -1;
                });

                // Launch all tasks except for deploy tasks
                wrangler.launchTasks(tasks.filter(function (task) {
                    return task.indexOf('deploy') === - 1;
                }), gulp);

                if (watchInterval !== null) {
                    clearInterval(watchInterval);
                }

                // Tasks called by `build:...`
                if (Array.isArray(bundle)) {
                    bundle.forEach(function (_bundle) {
                        otherTasks = otherTasks.concat(
                            wrangler.tasks.build.instance.getTasksForBundle(_bundle, wrangler));
                    });
                }
                else {
                    otherTasks = wrangler.tasks.build.instance.getTasksForBundle(bundle, wrangler);
                }

                watchInterval = setInterval(function () {
                    var hasDeployTasks = deployTasks.length > 0,
                        otherTasksComplete = doneTaskCount >= otherTasks.length,
                        deployTasksComplete = doneTaskCount >= (otherTasks.length + deployTasks.length);

                    if (!otherTasksComplete) {
                        doneTaskCount = (otherTasks.filter(function (key) {
                            if (key.indexOf('deploy') > -1) { return false; }
                            return gulp.tasks[key].done === true;
                        })).length;
                    }

                    else if (otherTasksComplete && !hasDeployTasks) {
                        console.log(chalk.cyan('\nBuild completed.'));
                        clearInterval(watchInterval);
                    }

                    else if (otherTasksComplete && hasDeployTasks && !deployTasksLaunched) {
                        console.log(chalk.cyan('\nBuild completed.'));
                    }

                    //wrangler.log('\nhasDeployTasks: ' + hasDeployTasks,
                    //    '\ndeployTasksComplete: ' + deployTasksComplete,
                    //    '\ndeployTasksLaunched: ' + deployTasksLaunched,
                    //    '\notherTasksComplete: ' + otherTasksComplete,
                    //    '\ndeployTasks.length: ' + deployTasks.length,
                    //    '\notherTasks.length: ' + otherTasks.length,
                    //    '\ndoneTaskCount: ' + doneTaskCount,
                    //    '\notherTasks: ' + otherTasks,
                    //    '\ndeployTasks: ' + deployTasks,
                    //    '\n\n', otherTasks);

                    if (hasDeployTasks) {

                        if (!deployTasksComplete && !deployTasksLaunched && otherTasksComplete) {

                            // Launch any `deploy` tasks that may have been defined
                            wrangler.launchTasks(deployTasks, gulp);

                            deployTasksLaunched = true;
                        }
                        else if (deployTasksComplete) {
                            clearInterval(watchInterval);
                            deployTasksLaunched = false;
                        }
                        else {
                            doneTaskCount = (deployTasks.filter(function (key) {
                                return gulp.tasks[key].done === true;
                            })).length + otherTasks.length;
                        }
                    }

                }, 1000);

                //console.log(gulp);

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
        var self = this,
            targets,
            tasks;

        if (!self.isBundleValidForTask(bundle)) {
            return; // @todo log message/warning here
        }

        targets = self.getSrcForBundle(bundle);

        // Watch the bundle file for changes (restart the watch task on bundle file changes)
        targets.push(bundle.get('filePath'));

        tasks = self.getTasksForBundle(bundle, wrangler.tasks.watch.tasks, wrangler);

        self.registerGulpTask(self.getTaskNameForBundle(bundle), targets,
            gulp, wrangler, bundle, tasks);

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
                targets = Array.isArray(keyVal) ? targets.concat(keyVal) :
                    (!sjl.empty(keyVal) ? targets.push(keyVal) : targets);
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
