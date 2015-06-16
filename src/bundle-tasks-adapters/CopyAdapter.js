/**
 * Created by Ely on 12/21/2014.
 */
/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
'use strict'; require('sjljs');

// Import base task proxy to extend
var FilesHashTaskAdapter = require('./FilesHashTaskAdapter'),
    //fs = require('fs'),
    chalk = require('chalk'),
    path = require('path');

module.exports = FilesHashTaskAdapter.extend(function CopyAdapter (options) {
    FilesHashTaskAdapter.apply(this, options);
}, {

    registerGulpTask: function (taskName, gulp, bundle, wrangler) {
        // Create task for bundle
        gulp.task(taskName, function () {
            return (new Promise(function (fulfill/*, reject*/) {

                console.log(chalk.cyan('Running "' + taskName + '" task.\n'));

                var copyTargets = bundle.options.copy.files;

                Object.keys(copyTargets).forEach(function (file) {
                    var newFile = copyTargets[file],
                        newFileBasePath = path.dirname(newFile);

                    // Pass the file source through gulp
                    gulp.src(wrangler.explodeGlob(file))

                        // Output the file src
                        .pipe(gulp.dest(newFileBasePath));
                });

                fulfill();
            }));

        }); // end of concat task
    },

    /**
     * Regsiters bundle with concat gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {
        this.registerGulpTask('copy:' + bundle.options.alias, gulp, bundle, wrangler);
    },

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            taskName,
            tasks = [],
            skipCopy = wrangler.argv.skipCopy;

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            taskName = 'copy:' + bundle.options.alias;
            self.registerGulpTask(taskName, gulp, bundle, wrangler);
            tasks.push(taskName);
        });

        gulp.task('copy', function () {
            if (skipCopy) {
                console.log(chalk.grey('Skipping copy task.\n'));
                return Promise.resolve();
            }
            console.log(chalk.cyan('Running "copy" task(s).\n'));
            return wrangler.launchTasks(tasks, gulp);
        });
    },

    isBundleValidForTask: function (bundle) {
        return bundle.has('copy.files');
    }

}); // end of export
