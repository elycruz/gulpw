/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var FilesHashTaskProxy = require('../FilesHashTaskProxy'),
    fs = require('fs'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    gulpif = require('gulp-if'),
    duration = require('gulp-duration'),
    chalk = require('chalk'),
    path = require('path');

module.exports = FilesHashTaskProxy.extend(function ConcatProxy (options) {
    FilesHashTaskProxy.apply(this, sjl.extend(true, {name: 'concat'}, options));
    this.alias = 'concat';
}, {

    /**
     * Regsiters bundle with concat gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

        // If bundle doesn't have any of the required keys, bail
        if (!this.isBundleValidForTask(bundle)) {
            return;
        }

        gulp.task('concat:' + bundle.options.alias, function () {
            wrangler.argv.dev = true;
            wrangler.launchTasks(['minify:' + bundle.options.alias], gulp);
        });

    } // end of `registerBundle`

}); // end of export
