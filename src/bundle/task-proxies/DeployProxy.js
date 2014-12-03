/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    path = require('path'),
    fs = require('fs'),
    ssh = require('ssh2'),
    yaml = require('js-yaml');

module.exports = TaskProxy.extend("DeployProxy", {

    registerGulpTask: function (taskPrefix, targets, gulp, wrangler) {
        console.log(wrangler.tasks.deploy);
        gulp.task('deploy' + (taskPrefix || ""), function () {
            var target;
            Object.keys(targets).forEach(function (key) {
                target = targets[key];
                console.log('Now deploying "' + key + '" files');
                target.forEach(function (item) {
                    console.log(item[0], ' => ', item[1]);
                });
            });

        });
    },

    registerBundle: function (bundle, gulp, wrangler) {

        // If bundle is not valid for task, bail
        if (!this.isBundleValidForTask(bundle)) {
            return;
        }

        this.mergeLocalConfigs(wrangler);

        // Task string separator
        var separator = wrangler.getTaskStrSeparator(),
            targets = this.getSrcForBundle(bundle, wrangler);

        this.registerGulpTask(':global', targets, gulp, wrangler);

    }, // end of `registerBundle`

    regsiterBundles: function (bundles, gulp, wrangler) {

    },

    getSrcForBundle: function (bundle, wrangler) {
        var self = this,
            srcs = {},
            allowedFileTypes = wrangler.tasks.deploy.allowedFileTypes,

            // dummy entry
            selectedServerEntry = wrangler.tasks.deploy.domainsToDevelop
                [wrangler.tasks.deploy.developingDomain];

        // Set file type arrays
        allowedFileTypes.forEach(function (fileType) {
            var hasDeployOtherFiles = bundle.has('deploy.otherFiles.' + fileType),
                hasFilesFileType = bundle.has('files.' + fileType),
                deployPath, localPath;

            // Check if bundle has files [js, css, allowed file types etc.]
            if (hasFilesFileType) {

                // Initialize storage array
                srcs[fileType] = [];

                // Build local src path
                deployPath = path.join(wrangler.tasks.minify[fileType + 'BuildPath'],
                    bundle.options.name + '.' + fileType);

                // Build deploy src path
                localPath = path.join(selectedServerEntry.typesAndDeployPathsMap[fileType],
                    bundle.options.name + '.' + fileType);

                // Push array map entry
                srcs[fileType].push([localPath, deployPath]);
            }

            // Check allowedFileType in deploy.otherFiles key
            if (hasDeployOtherFiles) {

                // Push array map entry
                srcs[fileType] = self.mapFileArrayToDeployArrayMap(
                    bundle.options.deploy.otherFiles[fileType], fileType,
                        selectedServerEntry, wrangler);
            }
        });

        return srcs;

    },

    mapFileArrayToDeployArrayMap: function (fileArray, fileType,
                                            selectedServerEntry, wrangler) {
        return fileArray.map(function (item) {
            var retVal;
            if (selectedServerEntry.typesAndDeployPathsMap[fileType]) {
                retVal = [item, path.join(selectedServerEntry.paths[fileType],
                    path.basename(item))];
            }
            else {
                retVal = [item, item];
            }

            return retVal;
        });
    },

    isBundleValidForTask: function (bundle) {
        return bundle && (
                bundle.has('files')
                || (bundle.has('requirejs') || bundle.has('browserify'))
                || bundle.has('deploy.otherFiles') );
    },

    mergeLocalConfigs: function (wrangler) {
        var localConfigPath = path.join(wrangler.localConfigPath, wrangler.tasks.deploy.localDeployFileName),
            localConfig;
        // Get local deploy config if exists
        if (fs.existsSync(localConfigPath)) {
            localConfig = yaml.safeLoad(fs.readFileSync(localConfigPath));
            sjl.extend(true, wrangler.tasks.deploy, localConfig);
        }
        return this;
    }

}); // end of export
