/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    fs = require('fs'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    minifyhtml = require('gulp-minify-html'),
    header = require('gulp-header'),
    gulpif = require('gulp-if'),
    path = require('path');

module.exports = TaskProxy.extend("MinifyProxy", {

    /**
     * Regsiters bundle with minify gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {GulpBundleWrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

        // Task string separator
        var separator = wrangler.getTaskStrSeparator(),
            taskConfigMap = {
                html: {instance: minifyhtml, options: wrangler.tasks.minify.htmlTaskOptions},
                css: {instance: minifycss, options: wrangler.tasks.minify.cssTaskOptions},
                js: {instance: uglify, options: wrangler.tasks.minify.jsTaskOptions},
            },
            useMinPreSuffix = wrangler.tasks.minify.useMinPreSuffix,
            bundleName = bundle.options.name;

        // Create task for bundle
        gulp.task('minify' + separator + bundleName, ['concat' + separator + bundleName], function () {

            // Check for sections on bundle that can be minified
            ['js', 'css', 'html'].forEach(function (ext) {
                var concatenatedFile = path.join(wrangler.cwd, wrangler.tasks.concat[ext + 'BuildPath'], bundleName + '.' + ext),
                    buildPath = path.join(wrangler.cwd, wrangler.tasks.minify[ext + 'BuildPath']),
                    taskInstanceConfig = taskConfigMap[ext];

                // If no files for this section, bail to the next one
                if (sjl.empty(sjl.namespace('options.files.' + ext, bundle))) {
                    return;
                }

                // Give gulp the list of sources to process
                gulp.src(bundle.options.files[ext])

                    .pipe(concat(path.join(buildPath, bundleName + '.' + ext)))

                    // Minify current source in the {artifacts}/ext directory
                    .pipe(gulpif(!wrangler.argv.dev, taskInstanceConfig.instance(taskInstanceConfig.options)))

                    // Add file header
                    .pipe(gulpif(ext !== 'html', header(wrangler.tasks.minify.header,
                            {bundle: bundle, fileExt: ext, fileHash: '{{file hash here}}'}) ))

                    // Dump to the directory specified in the `minify` call above
                    .pipe(gulpif(!wrangler.argv.dev, gulp.dest(buildPath), gulp.dest('./')));

            }); // end of loop

        }); // end of minify task

    } // end of `registerBundle`

}); // end of export
