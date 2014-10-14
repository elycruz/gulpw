/**
 * Created by edelacruz on 10/8/2014.
 */

require('sjljs');

var del = require('del'),
    TaskProxy = require('../TaskProxy.js');

module.exports = TaskProxy.extend(function CleanProxy(options) {
    TaskProxy.call(this, options);
}, {

    /**
     * Registers the clean gulp task for a `taskSuffix`.
     * @param taskSuffix {String} - Required
     * @param target {Array|Object|String} - Required
     * @param wrangler {GulpBundleWrangler} - Required
     * @return {void}
     */
    registerGulpTask: function (taskSuffix, target, gulp, wrangler) {
        gulp('clean' + wrangler.taskStrSeparator + taskSuffix, function (cb) {
            del(target, function (err) {
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
     * @param wrangler {GulpBundleWrangler} - Required
     * @param bundle {Bundle} - Required
     * @returns {void}
     */
    registerBundle: function (bundle, gulp, wrangler) {
        var self = this;

        // If bundle doesn't have a clean key then bail
        if (!bundle.hasClean()) {
            return;
        }

        // If clean key is an array or string register the bundle
        if (Array.isArray(bundle.options.clean)
            || sjl.classOfIs(bundle.options.clean, 'String')) {
            self.registerGulpTask(bundle.options.name, bundle.options.clean, gulp, wrangler);
        }

        // Else for each key in clean (except 'options'), register the clean gulp task
        else if (sjl.classOfIs(bundle.options.clean, 'Object')) {
            Object.keys(bundle.options.clean).forEach(function (key) {
                if (key === 'options') {
                    return;
                }
                self.registerGulpTask(bundle.options.name + wrangler.taskStrSeparator
                    + key, bundle.options.clean[key], gulp, wrangler);
            });
        }
    }
});