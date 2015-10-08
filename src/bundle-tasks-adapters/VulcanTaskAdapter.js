/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    vulcanize = require('gulp-vulcanize'),
    crisper = require('gulp-crisper'),
    gulpDuration = require('gulp-duration'),
    gulpSize = require('gulp-size'),
    gulpIf = require('gulp-if'),
    path = require('path'),
    chalk = require('chalk');

module.exports = BaseBundleTaskAdapter.extend(function VulcanTaskAdapter(/*options*/) {
    BaseBundleTaskAdapter.apply(this, arguments);
}, {

    registerGulpTask: function (taskName, gulp, wrangler, bundle) {
        var self = this;

        // Create task for bundle
        gulp.task(taskName, function () {

            var config = self.wrangler.cloneOptionsFromWrangler('tasks.vulcan', bundle.get('vulcan')),

                vulcanizeOptions = !sjl.issetObjKeyAndOfType(config, 'vulcanizeOptions', 'Object') ? {
                        inlineScripts: true,
                        inlineCss: true
                    } : config.vulcanizeOptions,

                crisperOptions = !sjl.issetObjKeyAndOfType(config, 'crisperOptions', 'Object') ? {
                    jsFileName: bundle.options.alias
                } : config.crisperOptions,

                sizeOptions = !sjl.issetObjKeyAndOfType(config, 'sizeOptions', 'Object') ?
                    null : config.sizeOptions,

                destDir = !sjl.issetObjKeyAndOfType(config, 'destDir', 'Object') ?
                    config.destDir : config.destDir;

            if (!sjl.issetObjKey(crisperOptions, 'jsFileName')) {
                crisperOptions.jsFileName = bundle.options.alias;
            }

            if (!sjl.empty(self.wrangler.argv.showFileSizes)) {
                sizeOptions = {
                    title: 'vulcan "' + bundle.options.alias + '"',
                    showFiles: true
                };
            }

            // Message 'Running task'
            console.log(chalk.cyan('Running "' + taskName + '" task.\n'));

            return gulp.src(bundle.get('vulcan.files'))

                .pipe(vulcanize(vulcanizeOptions))

                .pipe(crisper(crisperOptions))

                .pipe(gulp.dest(destDir))

                .pipe(gulpIf(!sjl.empty(sizeOptions), gulpSize(sizeOptions)))

                .pipe(gulpDuration(chalk.cyan('"' + taskName + '" duration: ')));

        }); // end of vulcanize task
    },

    /**
     * Regsiters bundle with vulcanize gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {
        this.registerGulpTask(this.getTaskNameForBundle(bundle), gulp, wrangler, bundle);
    },

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            taskName,
            targets;

        // If we do not have any bundles, bail
        if (!Array.isArray(bundles) || sjl.empty(bundles)) {
            return;
        }

        // Init targets list
        targets = [];

        // Loop through bundles for task name
        bundles.forEach(function (bundle) {

            // If bundle not valid skip it
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }

            // Get task name
            taskName = 'vulcanize:' + bundle.options.alias;

            // Push task name to targets list
            targets.push(taskName);

            self.registerBundle(bundle, gulp, wrangler);

            // Register singular task
            self.registerGulpTask(taskName, gulp, wrangler, bundle);
        });

        // If we have targets register them
        if (targets.length > 0) {
            self.registerGulpTasks('vulcanize', targets, gulp, wrangler);
        }
    },

    isBundleValidForTask: function (bundle) {
        var vulcanSection = bundle.get('vulcan'),
            classOfSection = sjl.classOf(vulcanSection);
        // If argv.fileTypes was passed in but no 'html' file type was passed as one of it's values
        // Do not run the vulcanize task (as it builds 'html' files).
        return (sjl.empty(this.wrangler.argv.fileTypes)
            || this.wrangler.argv.fileTypes.split(',').indexOf('html') > -1)
            && !sjl.empty(vulcanSection)
            && classOfSection === 'Object'
            && !sjl.isEmptyObjKeyOrNotOfType(vulcanSection, 'files', 'Array');
    }

}); // end of export
