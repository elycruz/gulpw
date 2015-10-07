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
    minifyInline = require('gulp-minify-inline'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    callback = require('gulp-fncallback'),
    gulpif = require('gulp-if'),
    duration = require('gulp-duration'),
    chalk = require('chalk'),
    path = require('path'),
    fileUtils = require('./../utils/file-utils'),
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
        if (!this.isBundleValidForTask(bundle)) {
            return;
        }

        var minifyConfig = wrangler.cloneOptionsFromWrangler('tasks.minify');
        if (bundle.has('minify')) {
            sjl.extend(true, minifyConfig, bundle.get('minify'))
        }
        sjl.extend(true, minifyConfig, bundle.get('files'));

        var self = this,
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
            fileHashType = minifyConfig.fileHashType || 'sha256',
            prependFileHashToFileName = minifyConfig.prependFileHashToFileName,
            appendFileHashToFileName = minifyConfig.appendFileHashToFileName;

        // Create task for bundle
        gulp.task(taskName, function () {

            // Allow filtering of file types via file-types param
            if (wrangler.hasArgvFileTypes()) {
                allowedFileTypes = allowedFileTypes.filter(function (item) {
                    return wrangler.getArgvFileTypes().indexOf(item) > -1;
                });
            }

            // If no allowedFileTypes resolve promise and exit task
            if (allowedFileTypes.length === 0) {
                return Promise.resolve();
            }

            // Check for sections on bundle that can be minified
            allowedFileTypes.forEach(function (ext) {

                var buildPath =
                    bundle.has('files.' + ext + 'BuildPath') ?
                        bundle.get('files.' + ext + 'BuildPath') :
                        minifyConfig[ext + 'BuildPath'],
                    taskInstanceConfig = taskConfigMap[ext],
                    eslintPipe = wrangler.getTaskAdapter('eslint').getPipe(bundle, gulp, wrangler),
                    cssLintPipe = wrangler.getTaskAdapter('csslint').getPipe(bundle, gulp, wrangler),
                    skipCssLinting = wrangler.skipLinting() || wrangler.skipCssLinting(),
                    skipJsLinting = wrangler.skipLinting() || wrangler.skipJsLinting(),
                    skipHashing = wrangler.argv.skipHashing,
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

                    .pipe(gulpif(ext === 'js' && !skipJsLinting, eslintPipe()))

                    .pipe(gulpif(ext === 'css' && !skipCssLinting, cssLintPipe()))

                    .pipe(concat(filePath))

                    // Add templates output string to end of file
                    .pipe(gulpif( !sjl.empty(tmplsString), footer(tmplsString)))

                    .pipe(duration(chalk.cyan(self.alias + ' "' + bundle.options.alias + ':' + ext + '" duration')))

                    // Minify current source in the {artifacts}/ext directory
                    .pipe(gulpif(!wrangler.argv.dev, taskInstanceConfig.instance(taskInstanceConfig.options)))

                    .pipe(callback(function (file, enc, cb) {
                        if (createFileHash) {
                            // Create file hasher
                            var hasher = crypto.createHash('md5');
                            hasher.update(file.contents.toString(enc));
                            bundle[ext + 'Hash'] = hasher.digest('hex');
                        }
                        cb();
                    }))

                    // Add file header
                    .pipe(gulpif(ext !== 'html', header(minifyConfig.header,
                        {bundle: bundle, fileExt: ext, fileHashType: fileHashType} )))

                    // Add file hash to file name
                    .pipe(callback(function (file, enc, cb) {
                        if (ext !== 'html') {
                            return cb();
                        }
                        // Create file hasher
                        var hasher = crypto.createHash('md5');
                        if (appendFileHashToFileName && !skipHashing) {
                            fileUtils.addFileHashToFilename(file, enc, hasher, false);
                        }
                        else if (prependFileHashToFileName && !skipHashing) {
                            fileUtils.addFileHashToFilename(file, enc, hasher, true);
                        }

                        if (appendFileHashToFileName || prependFileHashToFileName) {
                            cb(null, file);
                        }
                        else {
                            cb();
                        }
                    }))

                    .pipe(gulpif(ext === 'html', minifyInline()))

                    // Dump to the directory specified in the `minify` call above
                    .pipe(gulp.dest('./'));

            }); // end of loop

        }); // end of minify task

    } // end of `registerBundle`

}); // end of export
