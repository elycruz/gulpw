/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    path = require('path'),
    ssh = require('ssh2');

module.exports = TaskProxy.extend("DeployProxy", {

    registerGulpTask: function (taskPrefix, targets, gulp, wrangler) {
        gulp.task('deploy' + (taskPrefix || ""), function () {
            var target;
            Object.keys(targets).forEach(function (key) {
                target = targets[key];
                console.log('Now deploying "' + key + '" files');
                target.forEach(function (item) {
                    console.log(item);
                });
            });

        });
    },

    registerBundle: function (bundle, gulp, wrangler) {

        // Task string separator
        var separator = wrangler.getTaskStrSeparator(),
            targets = this.getSrcForBundle(bundle, wrangler);

        console.log('Dumping deploy targets here: ', targets);

        this.registerGulpTask(':global', targets, gulp, wrangler);

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
            var hasDeployOtherFiles = bundle.has('deploy.otherFiles.' + fileType),
                hasFilesFileType = bundle.has('files.' + fileType);

            if (hasDeployOtherFiles || hasFilesFileType) {
                srcs[fileType] = [];
            }

            // Check if bundle has files [js, css, allowed file types etc.]
            if (hasFilesFileType) {
                srcs[fileType].push(path.join(wrangler.tasks.minify[fileType + 'BuildPath'], bundle.options.name + '.' + fileType));
            }

            // Check allowedFileType in deploy.otherFiles key
            if (hasDeployOtherFiles) {
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
