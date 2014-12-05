/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
require('sjljs');

// Import base task proxy to extend
var FilesTaskProxy = require('../FilesTaskProxy'),
    fs = require('fs'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    gulpif = require('gulp-if'),
    duration = require('gulp-duration'),
    chalk = require('chalk'),
    path = require('path');

module.exports = FilesTaskProxy.extend(function RequireJsProxy(options) {
    FilesTaskProxy.apply(this, options);
    this.name = 'requirejs';
}, {

    /**
     * Regsiters bundle with requirejs gulp task.
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
            requireJsOptions = wrangler.tasks.requirejs,
            devMode = wrangler.argv.dev,
            bundleName = bundle.options.name,
            taskName = self.name + separator + bundleName;

        // Create task for bundle
        gulp.task(taskName, function () {


        }); // end of requirejs task

    } // end of `registerBundle`

}); // end of export
