/**
 * Created by edelacruz on 10/8/2014.
 */

require('sjljs');

var path = require('path'),
    del = require('del'),
    TaskProxy = require('../TaskProxy.js');

module.exports = TaskProxy.extend('CleanProxy', {

    /**
     * Registers the clean gulp task for a `taskSuffix`.
     * @param taskSuffix {String} - Required
     * @param targets {Array|String} - Required
     * @param wrangler {Wrangler} - Required
     * @return {void}
     */
    registerGulpTask: function (taskSuffix, targets, gulp, wrangler) {
        wrangler.log('At clean task register', '--debug');
        gulp.task('clean' + wrangler.taskStrSeparator + taskSuffix, function (cb) {
            del(targets, function (err) {
                if (err) {
                    console.log(err);
                }
            });
            return cb;
        });
    },

    /**
     * Registers bundle with the `clean` task.
     * @param gulp {gulp} - Required
     * @param wrangler {Wrangler} - Required
     * @param bundle {Bundle} - Required
     * @returns {void}
     */
    registerBundle: function (bundle, gulp, wrangler) {
        var self = this,
            bundleName = bundle.options.name,
            allowedFileTypes = wrangler.tasks.clean.allowedFileTypes || ['js', 'html',  'css'],
            separator = wrangler.taskStrSeparator,
            targets = [];

        // Register separate `clean` tasks for each section in `files` key
        allowedFileTypes.forEach(function (ext) {
            var section = bundle.options.files[ext],
                singularTaskTargets = [],
                filePath;

            // Check if `key` in `files` is buildable (concatable/minifiable)
            if (bundle.hasFiles() && self.isValidTaskSrc(section)) {

                // Get file path for `key` in `files`
                singularTaskTargets.push(path.join(wrangler.tasks.concat[ext + 'BuildPath'], bundleName + '.' + ext));
                singularTaskTargets.push(path.join(wrangler.tasks.minify[ext + 'BuildPath'], bundleName + '.' + ext));

                // Pass off the `filePath` to `targets` for later use
                targets = targets.concat(singularTaskTargets);

                console.log('here', targets);

                // Register task for `key`
                self.registerGulpTask(bundleName + separator + ext, singularTaskTargets, gulp, wrangler);
            }
        });

        // If clean key is set with a valid buildable src
        if (self.isValidTaskSrc(bundle.options.clean)) {
            console.log('here');
            self.registerGulpTask(bundleName, bundle.options.clean, gulp, wrangler);
        }

        // Register overall clean task
        if (targets.length > 0) {
            self.registerGulpTask(bundleName, targets, gulp, wrangler);
        }
    },

    isValidTaskSrc: function (src) {
        return (sjl.classOfIs(src, 'String') || sjl.classOfIs(src, 'Array')) && !sjl.empty(src);
    }
});