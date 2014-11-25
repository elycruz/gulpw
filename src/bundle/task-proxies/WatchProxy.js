/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    path = require('path');

module.exports = TaskProxy.extend("DeployProxy", {

    registerGulpTask: function (taskName, targets, gulp, wrangler) {
        var tasks, bundle,
            watchInterval = null;

        // @note testing hack.  This function will not be this way when it is done (should not use arguments object directly)
        if (arguments.length === 5) {
            tasks = arguments[arguments.length - 1];
        }

        else if (arguments.length === 6) {
            tasks = arguments[arguments.length - 2];
            bundle = arguments[arguments.length - 1];
            tasks = tasks.map(function (task) {
                return task + ':' + bundle.options.name;
            });
        }

        gulp.task(taskName, function () {

            console.log('Watching for file changes...]');

            gulp.watch(targets, function (event) {

                var doneTaskCount = 0;

                console.log('\nFile ' + event.path + ' was ' + event.type + ', running tasks...');

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
                    if (doneTaskCount === taskKeys.length) {
                        console.log('\nWatching for file changes...');
                        clearInterval(watchInterval);
                    }
                }, 100);

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
            self = this,
            bundleName = bundle.options.name,
            targets,
            tasks = wrangler.tasks.watch.tasks;

        if (!self.isBundleValidForTask(bundle)) {
            return; // @todo log message/warning here
        }

        targets = self.getSrcForTask(bundle);

        self.registerGulpTask('watch' + separator + bundleName, targets,
            gulp, wrangler, tasks, bundle);

    }, // end of `registerBundle`

    getSrcForTask: function (bundle) {
        var targets = [];

        // Bail if bundle is not valid for task
        if (!this.isBundleValidForTask(bundle)) {
            return;
        }

        // Merge other files to watch to targets
        if (bundle.hasWatch() && Array.isArray(bundle.options.otherFiles)) {
            targets = targets.concat(bundle.options.watch.otherFiles);
        }

        // Merge all arrays in files key to `targets`
        if (bundle.hasFiles()) {
            Object.keys(bundle.options.files).forEach(function (key) {
                var keyVal = bundle.options.files[key];
                targets = Array.isArray(keyVal) ? targets.concat(keyVal) :
                    (!sjl.empty(keyVal) ? targets.push(keyVal) : targets);
            });
        }

        return targets;
    },

    isBundleValidForTask: function (bundle) {
        return bundle && (bundle.hasFiles() || (bundle.hasRequirejs()
            || bundle.hasBrowserify()) || bundle.hasWatch());
    }

}); // end of export
