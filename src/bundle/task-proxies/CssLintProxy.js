/**
 * Created by edelacruz on 10/8/2014.
 */
/**
 * Created by edelacruz on 10/8/2014.
 */
require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy');

module.exports = TaskProxy.extend("CssLintProxy", {

    /**
     *
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {GulpBundleWrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

        // Task string separator
        var separator = wrangler.getTaskStrSeparator();

    } // end of `registerBundle`
});
