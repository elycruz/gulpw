/**
 * Created by Ely on 12/21/2014.
 */
/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
'use strict'; require('sjljs');

// Import base task proxy to extend
var FilesHashTaskProxy = require('../FilesHashTaskProxy'),
    //fs = require('fs'),
    //duration = require('gulp-duration'),
    //chalk = require('chalk'),
    path = require('path');
    //callback = require('gulp-fncallback')


module.exports = FilesHashTaskProxy.extend(function CopyProxy (options) {
    FilesHashTaskProxy.apply(this, sjl.extend(true, {alias: 'copy'}, options));
    this.alias = 'copy';
}, {
    /**
     * Regsiters bundle with concat gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

        // If bundle doesn't have any of the required keys, bail
        if (!this.isBundleValidForTask(bundle)) {
            return;
        }

        // Task string separator
        var separator = wrangler.getTaskStrSeparator(),
            taskName = 'copy' + separator + bundle.options.alias;

        // Create task for bundle
        gulp.task(taskName, function () {
            var copyTargets = bundle.options.copy.files;

            Object.keys(copyTargets).forEach(function (file) {
                var newFile = copyTargets[file],
                    newFileBasePath = path.dirname(newFile);

                // Pass the file source through gulp
                gulp.src(file)

                    // Output the file src
                    .pipe(gulp.dest(newFileBasePath));
            });

        }); // end of concat task

    }, // end of `registerBundle`

    isBundleValidForTask: function (bundle) {
        return bundle.has('copy.files');
    }

}); // end of export
