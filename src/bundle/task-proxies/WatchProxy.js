/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    chalk = require('chalk'),
    path = require('path');

module.exports = TaskProxy.extend("DeployProxy", {

    registerGulpTask: function (taskName, targets, gulp, wrangler, tasks) {
        var tasks,
            watchInterval = null;

        gulp.task(taskName, function () {

            console.log('\nWatching for changes...');

            gulp.watch(targets, function (event) {

                var doneTaskCount = 0,
                    fileShortPath = event.path;
                //
                //if (Array.isArray(targets) && targets.length > 0) {
                //    fileShortPath = targets.filter(function (file) {
                //        //console.log(file, '\n');
                //        file = file.indexOf('./') === 0 ? file.substr(1, file.length) : file;
                //        //console.log(file, '\n');
                //        return (fileShortPath.replace(/\\/, '/')).indexOf(file) > -1;
                //    })[0];
                //}
                //else if (sjl.classOfIs(targets, 'String')) {
                //    fileShortPath = targets;
                //}


                console.log('\n', 'File change detected at ' + fileShortPath + ';  Change type: ' + event.type + ';', 'Running tasks...', '\n');

                wrangler.launchTasks(tasks, gulp);

                if (watchInterval !== null) {
                    clearInterval(watchInterval);
                }

                watchInterval = setInterval(function () {
                    var taskKeys = Object.keys(gulp.tasks);
                    taskKeys.forEach(function (key) {
                        if (gulp.tasks[key].done === true) {
                            doneTaskCount += 1;
                        }
                    });
                    if (doneTaskCount === taskKeys.length - 1) {
                        console.log(chalk.cyan('\nBuild and Deploy completed.') + chalk.dim('\nNow watching for more changes...'));
                        clearInterval(watchInterval);
                    }
                }, 10);

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
            bundleName = bundle.options.name,
            self = this,
            targets,
            tasks;

        if (!self.isBundleValidForTask(bundle)) {
            return; // @todo log message/warning here
        }

        targets = self.getSrcForBundle(bundle);

        tasks = self.getTasksForBundle(bundle, wrangler.tasks.watch.tasks);

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
        if (bundle.hasWatch() && Array.isArray(bundle.options.otherFiles)) {
            targets = targets.concat(bundle.options.watch.otherFiles);
        }

        // Merge all arrays in files key to `targets`
        // @todo ommit files in `pre-artifact` folder if it is being used.
        if (bundle.hasFiles()) {
            Object.keys(bundle.options.files).forEach(function (key) {
                var keyVal = bundle.options.files[key];
                targets = Array.isArray(keyVal) ? targets.concat(keyVal) :
                    (!sjl.empty(keyVal) ? targets.push(keyVal) : targets);
            });
        }

        return targets;
    },

    getTasksForBundle: function (bundle, taskPrefixes) {
        return taskPrefixes.map(function (task) {
            return task + ':' + bundle.options.name;
        });
    },

    isBundleValidForTask: function (bundle) {
        return bundle && (bundle.hasFiles() || (bundle.hasRequirejs()
            || bundle.hasBrowserify()) || bundle.hasWatch());
    }

}); // end of export
