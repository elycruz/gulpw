/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    ssh = require('ssh2');

module.exports = TaskProxy.extend("DeployProxy", {

    registerGulpTask: function (taskPrefix, targets, gulp, wrangler) {
        gulp.task('deploy' + (taskPrefix || ""), function () {

        });
    },

    registerBundle: function (bundle, gulp, wrangler) {

        // Task string separator
        var separator = wrangler.getTaskStrSeparator();

        console.log(this.getSrcForBundle(bundle, wrangler));

        this.registerGulpTask(':global', [], gulp, wrangler);

    }, // end of `registerBundle`

    regsiterBundles: function (bundles, gulp, wrangler) {

    },

    getSrcForBundle: function (bundle, wrangler) {
        var srcs = {},
            options = bundle.options,
            allowedFileTypes = wrangler.tasks.deploy.allowedFileTypes;

        if (this.isBundleValidForTask()) {
            return srcs;
        }

        // Set file type arrays
        allowedFileTypes.forEach(function (fileType) {
            srcs[fileType] = [];

            // Check if bundle has files [js, css, allowed file types etc.]
            if (bundle.has('files.' + fileType)) {
                srcs[fileType].push(bundle.options.name + '.' + fileType);
            }

            // Check allowedFileType in deploy.otherFiles key
            if (bundle.has('deploy.otherFiles')) {
                srcs[fileType].push(bundle.options.deploy.otherFiles[fileType]);
            }
        });

        return srcs;

    },

    isBundleValidForTask: function (bundle) {
        return bundle && (
                bundle.has('files') || (bundle.has('requirejs') || bundle.has('browserify'))
                || bundle.has('deploy.otherFiles'));
    }

}); // end of export
