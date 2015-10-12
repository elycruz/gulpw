/**
 * Created by elycruz on 10/12/15.
 */
/**
 * Created by ElyDeLaCruz on 10/5/2014.
 * @todo write tests for this task
 * @note currently only tested with raw strings (not tested with regular expressions).
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    gulpCopyToClipboard = require('gulp-clipboard'),
    gulpDuration = require('gulp-duration'),
    chalk = require('chalk');

module.exports = BaseBundleTaskAdapter.extend(function CopyToClipboardTaskAdapter(/*options*/) {
    this.alias = 'copytoclipboard';
    BaseBundleTaskAdapter.apply(this, arguments);
}, {

    registerGulpTask: function (taskName, gulp, wrangler, bundle) {

        // Create task for bundle
        gulp.task(taskName, function () {

            var file = bundle.get('copytoclipboard.file'),
                files = bundle.get('copytoclipboard.files'),
                classOfFiles = sjl.classOf(files),
                classOfFile = sjl.classOf(file),
                src;

            // Message 'Running task'
            console.log(chalk.cyan('Running "' + taskName + '" task.\n'));

            if (classOfFile === 'String' || file.length > 0) {
                src = file;
            }
            else if ((classOfFiles === 'String' || classOfFiles === 'Array') && files.length > 0) {
                src = files;
            }
            else if (classOfFiles === 'Object') {
                throw new Error ('no support for files hash object yet.');
            }
            else {
                throw new Error ('No valid "file" or "files" key found for task "' + taskName + '".');
            }
            return gulp.src(src)
                .pipe(gulpCopyToClipboard())
                .pipe(gulpDuration(chalk.cyan('"' + taskName + '" duration: ')));

        }); // end of copytoclipboard task
    },

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
            taskName = self.getTaskNameForBundle(bundle);

            // Push task name to targets list
            targets.push(taskName);

            self.registerBundle(bundle, gulp, wrangler);

            // Register singular task
            self.registerGulpTask(taskName, gulp, wrangler, bundle);
        });

        // If we have targets register them
        if (targets.length > 0) {
            self.registerGulpTasks('copytoclipboard', targets, gulp, wrangler);
        }
    },

    isBundleValidForTask: function (bundle) {
        return bundle.has('copytoclipboard.files')
            || bundle.has('copytoclipboard.file');
    }

}); // end of export
