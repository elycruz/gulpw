/**
 * Created by edelacruz on 9/19/2014.
 */
require('sjljs');

module.exports = sjl.Extendable.extend(function TaskProxy(options) {
        sjl.extend(true, this, {
            name: "Task's cli name goes here.",
            description: "Task's description goes here.",
            help: "Task's help details go here."
        }, options);
    },
    {
        registerBundle: function (bundle) {
            // Overwrite from extending class
        },

        registerBundles: function (bundles, gulp, wrangler) {
            // Overwrite from extending class
        },

        registerGulpTasks: function (taskName, tasks, gulp, wrangler) {
            gulp.task(taskName, function () {
                wrangler.launchTasks(tasks, gulp);
            });
        },

        launchTasks: function (tasks, gulp, wrangler) {
            return wrangler.launchTasks(tasks, gulp);
        },

        isBundleValidForTask: function (bundle) {
            // Overwrite from extending class
        },

        isValidTaskSrc: function (src) {
            return (sjl.classOfIs(src, 'String') || sjl.classOfIs(src, 'Array')) && !sjl.empty(src);
        },

        getTasksForBundle: function (bundle, targets, ignoredTasks) {
            return targets.map(function (task) {
                return task + ':' + bundle.options.name;
            });
        }

    });
