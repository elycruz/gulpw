/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var FilesHashTaskAdapter = require('../FilesHashTaskAdapter');

module.exports = FilesHashTaskAdapter.extend(function ConcatAdapter (options) {
    FilesHashTaskAdapter.apply(this, sjl.extend(true, {name: 'concat'}, options));
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
            return wrangler.launchTasks(['minify:' + bundle.options.alias], gulp);
        });

    } // end of `registerBundle`

}); // end of export
