/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
require('sjljs');

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    os = require('os'),
    path = require('path'),
    fs = require('fs'),
    ssh = require('ssh2'),
    conn = new ssh(),
    chalk = require('chalk'),
    yaml = require('js-yaml');

module.exports = TaskProxy.extend("DeployProxy", {

    registerGulpTask: function (taskPrefix, targets, gulp, wrangler) {

        var deployOptions = wrangler.tasks.deploy,
            host = deployOptions.devHostnamePrefix + deployOptions.devHostname,
            sshOptions = {
                host: host,
                username: deployOptions.username,
                password: deployOptions.password,
                port: deployOptions.port
            },
            totalFileCount = 0,
            uploadedFileCount = 0,
            startDeployMessage = 'Deploying ',
            taskName = 'deploy' + (taskPrefix || ""),
            startTime;

        // Get file count
        Object.keys(targets).forEach(function (key, index, list) {
            startDeployMessage += (index === 0 ? '' : (index < list.length - 1 ? ', ' : ' and ')) + '*.' + key;
            totalFileCount += targets[key].length;
        });

        startDeployMessage += ' files.';

        gulp.task(taskName, function () {

            wrangler.log('\n', chalk.dim(' Running "' + taskName + '" task.'), '--mandatory');

            startTime = new Date();

            conn.on('ready', function () {

                wrangler.log(chalk.dim('\n Connected to ' + host), '--mandatory');

                conn.sftp(function (err, sftp) {

                    if (err) {
                        throw err;
                    }

                    var target;

                    wrangler.log('\n', startDeployMessage, '\n', '--mandatory');

                    Object.keys(targets).forEach(function (key) {
                        target = targets[key];
                        target.forEach(function (item) {
                            sftp.fastPut(item[0], item[1],

                                // Callback
                                function (err) {
                                    wrangler.log(chalk.green(' - ', item[0]), '--mandatory')
                                        wrangler.log(chalk.green(' => ', item[1]));
                                    if (err) { throw err; }
                                    uploadedFileCount += 1;
                                });
                        });
                    }); // end of files loop

                    var countTimeout = setInterval(function () {
                        if (totalFileCount <= uploadedFileCount) {
                            wrangler.log(chalk.cyan('\n File deployment complete.'),
                                chalk.dim('\n\n Closing connection...'));
                            conn.end();
                            clearInterval(countTimeout);
                        }
                    }, 500);

                });

            })
            .on('close', function (hadError) {

                // Log "Connection closed"
                wrangler.log(chalk.dim('\n Connection closed.'));

                // Log task completion
                wrangler.log('\n', chalk.cyan(taskName) + chalk.green(' complete') + chalk.cyan('. Duration: ') +
                    chalk.magenta((((new Date()) - startTime) / 1000) + 's'), '--mandatory');

                // If error log it
                if (hadError) {
                    wrangler.log('\n Connection closed due to an unknown error.', '--mandatory');
                }
            })
            .connect(sshOptions);

        });
    },

    registerBundle: function (bundle, gulp, wrangler) {

        // If bundle is not valid for task, bail
        if (!this.isBundleValidForTask(bundle)) {
            console.warn(chalk.yellow('Bundle "' +
                bundle.options.name + '" is not valid for `deploy` task.'));
            return;
        }

        this.mergeLocalConfigs(wrangler);

        // Task string separator
        var targets = this.getSrcForBundle(bundle, wrangler);

        this.registerGulpTask(':' + bundle.options.name, targets, gulp, wrangler);

    }, // end of `registerBundle`

    regsiterBundles: function (bundles, gulp, wrangler) {

    },

    getSrcForBundle: function (bundle, wrangler) {
        var self = this,
            srcs = {},
            deployOptions = wrangler.tasks.deploy,
            allowedFileTypes = deployOptions.allowedFileTypes,
            deployUsingUnixStylePaths = deployOptions.deployUsingUnixStylePaths,
            selectedServerEntry = deployOptions.domainsToDevelop
                [deployOptions.developingDomain];

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
                localPath = path.join(wrangler.tasks.minify[fileType + 'BuildPath'],
                    bundle.options.name + '.' + fileType);

                // Build deploy src path
                if (selectedServerEntry.typesAndDeployPathsMap[fileType]) {
                    deployPath = path.join(selectedServerEntry.deployRootFolder, selectedServerEntry.typesAndDeployPathsMap[fileType],
                        bundle.options.name + '.' + fileType);
                }
                else {
                    deployPath = path.join(selectedServerEntry.deployRootFolder, bundle.options.name + '.' + fileType);
                }

                // Check if we need styled unix paths and are on windows
                if (deployUsingUnixStylePaths && ((os.type()).toLowerCase()).indexOf('windows') > -1) {
                    deployPath = deployPath.replace(/\\/g, '/');
                }

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
                retVal = [item, path.join(selectedServerEntry.deployRootFolder, selectedServerEntry.typesAndDeployPathsMap[fileType],
                    path.basename(item))];
            }
            else {
                retVal = [item, path.join(selectedServerEntry.deployRootFolder, item)];
            }

            // Check if we need styled unix paths and are on windows
            if (wrangler.tasks.deploy.deployUsingUnixStylePaths && ((os.type()).toLowerCase()).indexOf('windows') > -1) {
                retVal[1] = retVal[1].replace(/\\/g, '/');
            }

            retVal[0] = path.normalize(retVal[0]);

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
