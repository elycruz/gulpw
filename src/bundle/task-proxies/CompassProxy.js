/**
 * Created by edelacruz on 10/8/2014.
 */
/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
"use strict"; require("sjljs");

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy');

module.exports = TaskProxy.extend("CompassProxy", {

    /**
     * Regsiters bundle with `compass` or `sass` gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

        // Task string separator
        var separator = wrangler.getTaskStrSeparator();

    } // end of `registerBundle`

}); // end of export
