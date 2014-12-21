/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
"use strict"; require("sjljs");

// Import base task proxy to extend
var FilesHashTaskProxy = require('../FilesHashTaskProxy'),
    fs = require('fs'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    minifyhtml = require('gulp-minify-html'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    gulpif = require('gulp-if'),
    duration = require('gulp-duration'),
    chalk = require('chalk'),
    path = require('path');

module.exports = FilesHashTaskProxy.extend(function MinifyProxy(options) {
    FilesHashTaskProxy.apply(this, options);
    this.alias = 'minify';
}, {

    /**
     * Regsiters bundle with minify gulp task.
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
        var self = this,
            separator = wrangler.getTaskStrSeparator(),
            taskConfigMap = {
                html: {instance: minifyhtml, options: wrangler.tasks.minify.htmlTaskOptions, linter: null},
                css: {instance: minifycss, options: wrangler.tasks.minify.cssTaskOptions, linter: null},
                js: {instance: uglify, options: wrangler.tasks.minify.jsTaskOptions, linter: null}
            },
            useMinPreSuffix = wrangler.tasks.minify.useMinPreSuffix,
            bundleName = bundle.options.alias,
            taskName = self.alias + separator + bundleName;

        //taskConfigMap.js.linter = wrangler.tasks.jshint.instance.toLazyPipe();

        // Create task for bundle
        gulp.task(taskName, function () {

            // Check for sections on bundle that can be minified
            ['js', 'css', 'html'].forEach(function (ext) {
                var buildPath = wrangler.tasks.minify[ext + 'BuildPath'],
                    taskInstanceConfig = taskConfigMap[ext],
                    jsHintPipe = wrangler.tasks.jshint.instance.getPipe(bundle, gulp, wrangler),
                    cssLintPipe = wrangler.tasks.csslint.instance.getPipe(bundle, gulp, wrangler),
                    skipCssLinting = wrangler.skipCssLinting() || wrangler.skipLinting(),
                    skipJsLinting = wrangler.skipJsLinting() || wrangler.skipLinting(),
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
                gulp.src(bundle.options.files[ext])

                    .pipe(gulpif(ext === 'js' && !skipJsLinting, jsHintPipe()))

                    .pipe(gulpif(ext === 'css' && !skipCssLinting, cssLintPipe()))

                    .pipe(concat(filePath))

                    .pipe(gulpif( !sjl.empty(tmplsString), footer(tmplsString) ))

                    .pipe(duration(chalk.cyan(self.alias + ' "' + bundle.options.alias + ':' + ext + '" duration')))

                    // Minify current source in the {artifacts}/ext directory
                    .pipe(gulpif(!wrangler.argv.dev, taskInstanceConfig.instance(taskInstanceConfig.options)))

                    // Add file header
                    .pipe(gulpif(ext !== 'html', header(wrangler.tasks.minify.header,
                            {bundle: bundle, fileExt: ext, fileHash: '{{file hash here}}'}) ))

                    // Dump to the directory specified in the `minify` call above
                    .pipe(gulp.dest('./'));

            }); // end of loop

        }); // end of minify task

    } // end of `registerBundle`

}); // end of export
