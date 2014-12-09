/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy');

module.exports = TaskProxy.extend("BuildProxy", {

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
            taskName = 'build' + separator + bundleName,
            targets;

        if (!self.isBundleValidForTask(bundle)) {
            console.warn('\n' + chalk.yellow('Warning: Bundle "' + bundleName + '" is not valid for `build` task.') + '\n');
            return; // @todo log message/warning here
        }

        targets = self.getTasksForBundle(bundle, wrangler);

        self.registerGulpTasks(taskName, targets, gulp, wrangler);

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

        // If bundle has minifiable or concatable sources build
        if (this.isBundleValidForMinifyAndConcat(bundle)) {
            // @todo put a condition here so that we run concat and copy the
            // file over to the build directory when the '--dev' flag is passed in
            //targets.push('concat' +  separator + bundleName);
            targets.push('minify' + separator + bundleName); // does both minify and concat
        }

        return targets;
    }

}); // end of export
