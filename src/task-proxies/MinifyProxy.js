/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy');

module.exports = TaskProxy.extend("MinifyProxy", {

    /**
     * Regsiters bundle with uglify gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {GulpBundleWrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

        // Task string separator
        var separator = wrangler.getTaskStrSeparator();

        // Create task for bundle
        gulp.task('minify' + separator + bundle.name, function () {

            // Check for sections on bundle that can be uglifyenated
            ['js', 'css'].forEach(function (ext) {
                var section = bundle[ext];

                // If section is empty or not an array exit the function
                if (sjl.empty(section) || !Array.isArray(section)) {
                    return;
                }

                // Give gulp the list of sources to process
                gulp.src(wrangler.getDirSafe('artifacts.' + ext) + bundle.name + '.' + ext)

                    // Uglify artifact file for current bundle (artifact file is at wrangler.dirs.artifacts[extension] directory)
                    .pipe(uglify())

                    // Add file header
                    .pipe(header('/**! <%= bundle.name %>.<%= ext %> <%= bundle.version %> <%= (new Date()) %> **/'))

                    // Dump to the directory build folder in the wrangler config for this `ext` type
                    .pipe(gulp.dest('./' + wrangler.getDirSafe('build.' + ext) + bundle.name + '.' + ext));

            }); // end of loop

        }); // end of uglify task

    } // end of `registerBundle`
});
