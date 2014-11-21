/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy');

module.exports = TaskProxy.extend("BrowserifyProxy", {

    /**
     * Regsiters bundle with `browserify` gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {GulpBundleWrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

        // Task string separator
        var separator = wrangler.getTaskStrSeparator();

    } // end of `registerBundle`

}); // end of export
