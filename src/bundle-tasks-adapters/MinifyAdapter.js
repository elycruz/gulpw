/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
'use strict'; require('sjljs');

// Import base task proxy to extend
var FilesHashTaskAdapter = require('./FilesHashTaskAdapter'),
    //fs = require('fs'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    minifyhtml = require('gulp-minify-html'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    callback = require('gulp-fncallback'),
    gulpif = require('gulp-if'),
    duration = require('gulp-duration'),
    chalk = require('chalk'),
    path = require('path'),
    crypto = require('crypto');

module.exports = FilesHashTaskAdapter.extend(function MinifyAdapter() {
    FilesHashTaskAdapter.apply(this, sjl.argsToArray(arguments));
}, {

    /**
     * Regsiters bundle with minify gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

        //console.log('wrangler.tasks.minify.notConfiguredByUser: ', wrangler.tasks.minify.notConfiguredByUser);

        // If bundle doesn't have any of the required keys or task is not configured by user, bail
        if (!this.isBundleValidForTask(bundle) || wrangler.tasks.minify.hasOwnProperty('notConfiguredByUser')
            && wrangler.tasks.minify.notConfiguredByUser) {
            return;
        }

        var self = this,
            minifyConfig = bundle.has('minify') ?
                sjl.extend(true, wrangler.clone(wrangler.tasks.minify), bundle.get('minify'))
                    : wrangler.tasks.minify,
            taskConfigMap = {
                html: {instance: minifyhtml, options: minifyConfig.htmlTaskOptions},
                css: {instance: minifycss, options: minifyConfig.cssTaskOptions},
                js: {instance: uglify, options: minifyConfig.jsTaskOptions}
            },
            //useMinPreSuffix = minifyConfig.useMinPreSuffix,
            bundleName = bundle.options.alias,
            taskName = self.alias + ':' + bundleName,
            allowedFileTypes = minifyConfig.allowedFileTypes,
            createFileHash = minifyConfig.createFileHashes || true,
            fileHashType = minifyConfig.fileHashType || 'sha256';

        // Create task for bundle
        gulp.task(taskName, function () {

            // Check for sections on bundle that can be minified
            allowedFileTypes.forEach(function (ext) {
                var buildPath = minifyConfig[ext + 'BuildPath'],
                    taskInstanceConfig = taskConfigMap[ext],
                    jsHintPipe = wrangler.getTaskAdapter('jshint').getPipe(bundle, gulp, wrangler),
                    cssLintPipe = wrangler.getTaskAdapter('csslint').getPipe(bundle, gulp, wrangler),
                    skipCssLinting = wrangler.skipLinting() || wrangler.skipCssLinting(),
                    skipJsLinting = wrangler.skipLinting() || wrangler.skipJsLinting(),
                    filePath,
                    tmplsString;

                // If no files for this section, bail to the next one
                if (!bundle.has('files.' + ext)) {
                    return;
                }

                filePath = path.join(buildPath, bundle.options.alias + '.' + ext);

                // Only populate template string if extension we're looking at is 'js'
                tmplsString = ext === 'js' ? self.getTemplatesString(bundle, gulp, wrangler) : null;

                // Give gulp the list of sources to process
                return gulp.src(bundle.options.files[ext])

                    .pipe(gulpif(ext === 'js' && !skipJsLinting, jsHintPipe()))

                    .pipe(gulpif(ext === 'css' && !skipCssLinting, cssLintPipe()))

                    .pipe(concat(filePath))

                    // Add templates output string to end of file
                    .pipe(gulpif( !sjl.empty(tmplsString), footer(tmplsString)))

                    .pipe(duration(chalk.cyan(self.alias + ' "' + bundle.options.alias + ':' + ext + '" duration')))

                    // Minify current source in the {artifacts}/ext directory
                    .pipe(gulpif(!wrangler.argv.dev, taskInstanceConfig.instance(taskInstanceConfig.options)))

                    .pipe(callback(function (file, enc, cb) {
                        if (createFileHash) {
                            var hasher = crypto.createHash(fileHashType);
                            hasher.update(file.contents.toString(enc));
                            bundle[ext + 'Hash'] = hasher.digest('hex');
                        }
                        cb();
                    }))

                    // Add file header
                    .pipe(gulpif(ext !== 'html', header(minifyConfig.header,
                        {bundle: bundle, fileExt: ext, fileHashType: fileHashType} )))

                    // Dump to the directory specified in the `minify` call above
                    .pipe(gulp.dest('./'));

            }); // end of loop

        }); // end of minify task

    } // end of `registerBundle`

}); // end of export
