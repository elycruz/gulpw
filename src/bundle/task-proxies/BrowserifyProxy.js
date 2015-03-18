/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
'use strict'; require('sjljs');

// Import base task proxy to extend
var TaskAdapter = require('../TaskAdapter');

module.exports = TaskAdapter.extend('BrowserifyAdapter', {

    /**
     * Regsiters bundle with `browserify` gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {
        // Write code
    } // end of `registerBundle`

}); // end of export
