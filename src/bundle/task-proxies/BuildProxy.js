/**
 * Created by edelacruz on 10/8/2014.
 */
/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy');

module.exports = TaskProxy.extend("BuildProxy", {

    registerGulpTask: function (taskName, taskList, gulp, wrangler) {
        gulp.task(taskName, function () {
            wrangler.launchTasks(taskList, gulp);
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
            taskName = 'build',
            bundleName = bundle.options.name,
            targets;

        if (!self.isBundleValidForTask(bundle)) {
            return; // @todo log message/warning here
        }

        targets = self.getTasksForBundle(bundle, wrangler);

        self.registerGulpTask('build' + separator + bundleName, targets, gulp, wrangler);

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

        self.registerGulpTask('build', targets, gulp, wrangler);
    },

    isBundleValidForTask: function (bundle) {
        return bundle && bundle.hasFiles() || (bundle.hasRequirejs() || bundle.hasBrowserify());
    },

    isBundleValidForMinifyAndConcat: function (bundle) {
       return bundle && bundle.hasFilesJs() || bundle.hasFilesCss() || bundle.hasFilesHtml();
    },

    getTasksForBundle: function (bundle, wrangler) {
        var separator = wrangler.getTaskStrSeparator(),
            bundleName = bundle.options.name,
            targets = [],
            ignoredTasks = wrangler.tasks.build.ignoredTasks;
        Object.keys(wrangler.tasks).forEach(function (task) {
            if (sjl.empty(bundle.options[task]) || ignoredTasks.indexOf(task) > -1) {
                return;
            }
            targets.push(task + separator + bundleName);
        });

        if (this.isBundleValidForMinifyAndConcat(bundle)) {
            // @todo put a condition here so that we run concat and copy the
            // file over to the build directory when the '--dev' flag is passed in
            //targets.push('concat' +  separator + bundleName);
            targets.push('minify' + separator + bundleName); // does both minify and concat
        }

        return targets;
    }

}); // end of export
