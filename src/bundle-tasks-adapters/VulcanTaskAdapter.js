/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    vulcanize = require('gulp-vulcanize'),
    crisper = require('gulp-crisper'),
    fncallback = require('gulp-fncallback'),
    crypto = require('crypto'),
    gulpDuration = require('gulp-duration'),
    gulpSize = require('gulp-size'),
    chalk = require('chalk');

module.exports = BaseBundleTaskAdapter.extend(function VulcanTaskAdapter (/*options*/) {
    BaseBundleTaskAdapter.apply(this, arguments);
}, {

    registerGulpTask: function (taskName, gulp, wrangler, bundle) {
        var self = this;

        // Create task for bundle
        gulp.task(taskName, function () {

            var hasher = crypto.createHash('sha256');

            // Message 'Running task'
            console.log(chalk.cyan('Running "' + taskName + '" task.\n'));

            return gulp.src(bundle.get('vulcan.files'))

                .pipe(vulcanize({
                    inlineScripts: true,
                    inlineCss: true
                }))

                // Add file hash to file name
                .pipe(fncallback(function (file, enc, cb) {
                    hasher.update(file.contents.toString(enc));
                    file.basename = file.basename + '-' + hasher.digest('hex');
                    cb();
                }))

                .pipe(crisper())

                .pipe(gulp.dest(bundle.get('vulcan.destDir')))

                // Notify of task completion and task duration
                .pipe(gulpDuration('[' + chalk.green('gulp') + ']' +
                    chalk.cyan(' "' + taskName + '" completed.  Duration: ')))

                .pipe(gulpSize());

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

    getVulcanOptions: function (bundle) {
        // Get 'vulcanize' section
        var vulcanOptions = bundle.get('vulcan');

        // Get 'options' part of 'vulcanize' section
        if (bundle.has('vulcan.vulcanizeOptions')) {
            vulcanOptions = vulcanOptions.options;
        }

        // If options are empty throw an error
        if (sjl.empty(vulcanOptions)) {
            //console.warn('`VulcanAdapter.getVulcanOptions` expects `vulcan.vulcanizeOptions` to be a non empty object.');
        }

        // Extend global 'vulcanize' options if any
        vulcanOptions = this.wrangler.cloneOptionsFromWrangler('tasks.vulcan', vulcanOptions);

        // return options
        return vulcanOptions;
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
