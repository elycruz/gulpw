/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
require('sjljs');

// Import base task proxy to extend
var FilesTaskProxy = require('../FilesTaskProxy'),
    fs = require('fs'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    gulpif = require('gulp-if'),
    duration = require('gulp-duration'),
    chalk = require('chalk'),
    path = require('path');

module.exports = FilesTaskProxy.extend(function ConcatProxy (options) {
    FilesTaskProxy.apply(this, sjl.extend(true, {name: 'concat'}, options));
    this.name = 'concat';
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
            taskName = 'concat' + separator + bundle.options.name;

        // Create task for bundle
        gulp.task(taskName, function () {

            // Check for sections on bundle that can be concatenated
            ['js', 'css', 'html'].forEach(function (ext) {
                var section = bundle.options.files[ext];

                // If section is empty or not an array exit the function
                if (sjl.empty(section) || !Array.isArray(section)) {
                    return;
                }

                var filePath = path.join(wrangler.tasks.concat[ext + 'BuildPath'], bundle.options.name + '.' + ext),
                    fileBasePath = path.dirname(filePath);

                // If file basepath doesn't exist make sure it is created
                if (!fs.existsSync(fileBasePath)) {
                    wrangler.ensurePathExists(fileBasePath);
                }

                // Else if output file already exists remove it
                else if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }

                // Give gulp the list of sources to process
                gulp.src(section)

                    .pipe(duration(chalk.cyan('concat "' + bundle.options.name + ':' + ext + '" duration')))

                    // Concatenate current source in the {artifacts}/ext directory
                    .pipe(concat(filePath))

                    // Add file header
                    .pipe(gulpif(ext !== 'html', header(wrangler.tasks.concat.header, {
                            bundle: bundle, fileExt: ext, fileHash: '{{file hash here}}'} )))

                    // Dump to the directory specified in the `concat` call above
                    .pipe(gulp.dest('./'));

            }); // end of loop

        }); // end of concat task

    } // end of `registerBundle`

}); // end of export
