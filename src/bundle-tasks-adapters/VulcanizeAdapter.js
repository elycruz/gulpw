/**
 * Created by elycruz on 9/29/15.
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    vulcanize = require('gulp-vulcanize'),
    chalk = require('chalk');

module.exports = BaseBundleTaskAdapter.extend(function VulcanizeAdapter (/*options*/) {

    BaseBundleTaskAdapter.apply(this, arguments);

}, {

    registerGulpTask: function (taskName, vulcanizeOptions, gulp, wrangler, bundle) {
        var self = this;

        // Create task for bundle
        gulp.task(taskName, function () {

            // Message 'Running task'
            console.log(chalk.cyan('Running "' + taskName + '" task.\n'));

            gulp.src(bundle.vulcanize.files)

                .pipe(vulcanize(self.getVulcanizeOptions(bundle)))

                .pipe(gulp.dest(bundle.vulcanize.destDir));

            // Notify of task completion and task duration
            //console.log('[' + chalk.green('gulp') + ']' +
            //    chalk.cyan(' "' + taskName + '" completed.  Duration: ') +
            //    chalk.magenta((((new Date()) - start) / 1000) + 'ms\n'));

        }); // end of vulcanize task
    },

    /**
     * Regsiters bundle with vulcanize gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {
        // Bundle name for task
        var bundleName = bundle.options.alias,

        // Task name
            taskName = this.alias + ':' + bundleName,

        // Rjs command (adding prefix for windows version)
            vulcanizeOptions = this.getVulcanizeOptions(bundle, wrangler);

        this.registerGulpTask(taskName, vulcanizeOptions, gulp, wrangler, bundle);

    }, // end of `registerBundle`

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
            self.registerGulpTask(taskName, self.getVulcanizeOptions(bundle, wrangler), gulp, wrangler, bundle);
        });

        // If we have targets register them
        if (targets.length > 0) {
            self.registerGulpTasks('vulcanize', targets, gulp, wrangler);
        }

    },

    getVulcanizeOptions: function (bundle, wrangler) {
        // Get 'vulcanize' section
        var vulcanizeOptions = bundle.get('vulcanize');

        // Get 'options' part of 'vulcanize' section
        if (bundle.has('vulcanize.options')) {
            vulcanizeOptions = vulcanizeOptions.options;
        }

        // If options are empty throw an error
        if (sjl.empty(vulcanizeOptions)) {
            console.warn('`VulcanizeAdapter.getVulcanizeOptions` expects `vulcanize.options` to be a non empty object.');
        }

        // Extend global 'vulcanize' options if any
        vulcanizeOptions = wrangler.cloneOptionsFromWrangler('tasks.vulcanize.options', vulcanizeOptions);

        // return options
        return vulcanizeOptions;
    },

    isBundleValidForTask: function (bundle) {
        var vulcanizeSection = bundle.get('vulcanize'),
            classOfSection = sjl.classOf(vulcanizeSection);
        // If argv.fileTypes was passed in but no 'html' file type was passed as one of it's values
        // Do not run the vulcanize task (as it builds 'html' files).
        return (sjl.empty(this.wrangler.argv.fileTypes)
            || this.wrangler.argv.fileTypes.split(',').indexOf('html') > -1)
            && !sjl.empty(vulcanizeSection)
            && classOfSection === 'Object'
            && !sjl.isEmptyOrNotOfType(vulcanizeSection.files, 'Array');
    }

}); // end of export
