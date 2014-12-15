/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */

"use strict"; require("sjljs");

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    os = require('os'),
    path = require('path'),
    fs = require('fs'),
    ssh = require('ssh2'),
    chalk = require('chalk'),
    yaml = require('js-yaml');

module.exports = TaskProxy.extend("DeployProxy", {

    registerGulpTask: function (taskPrefix, targets, gulp, wrangler) {

        var self = this,
            deployOptions = wrangler.tasks.deploy,
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
            startDeployMessage += (index === 0 ? '' :
                (index < list.length - 1 ? ', ' : ' and ')) + (key !== 'relative' ? '*.' : '') + key;
            totalFileCount += targets[key].length;
        });

        startDeployMessage += ' files.';

        gulp.task(taskName, function () {

            var conn = new ssh();

            wrangler.log('\n', 'Running ' + chalk.cyan('"' + taskName + '"') + ' task.', '--mandatory');

            startTime = new Date();

            conn.on('ready', function () {

                wrangler.log(chalk.dim('\n Connected to ' + host), '--mandatory');

                // Make sure directories exist

                conn.sftp(function (err, sftp) {

                    if (err) { throw err; }

                    var target;

                    wrangler.log('\n', chalk.grey(startDeployMessage), '\n', '--mandatory');

                    // Loop through all target keys in targets
                    Object.keys(targets).forEach(function (key) {

                        // Get file pair ([local-file, server-file])
                        target = targets[key];

                        // Loop through files and upload them
                        target.forEach(function (item) {

                            // Make sure directories exist before trying to put files to them
                            conn.exec('mkdir -p ' + path.dirname(item[1]), function (err2, stream) {

                                // If error
                                if (err) {
                                    wrangler.log('', err2, '--debug');
                                }

                                // Put file to server
                                sftp.fastPut(item[0], item[1],

                                    // Callback
                                    function (err3) {
                                        wrangler.log(chalk.green(' ' + String.fromCharCode(8730)), item[0], '--mandatory')
                                        wrangler.log(chalk.green(' => ', item[1]));
                                        if (err3) { throw err3; }
                                        uploadedFileCount += 1;
                                    });
                            });

                        });

                    }); // end of files loop

                    var countTimeout = setInterval(function () {
                        if (totalFileCount <= uploadedFileCount) {
                            wrangler.log(chalk.cyan('\n File deployment complete.'),
                                chalk.grey('\n\n Closing connection...'));
                            gulp.tasks[taskName].done = true;
                            conn.end();
                            clearInterval(countTimeout);
                        }
                    }, 500);

                });

            })
            .on('close', function (hadError) {

                // Log "Connection closed"
                wrangler.log(chalk.grey('\n Connection closed.'));

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
                bundle.options.alias + '" is not valid for `deploy` task.'));
            return;
        }

        this.mergeLocalConfigs(gulp, wrangler);

        // Task string separator
        var targets = this.getSrcForBundle(bundle, wrangler);

        this.registerGulpTask(':' + bundle.options.alias, targets, gulp, wrangler);

    }, // end of `registerBundle`

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            targets = {};

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            var bundleTargets = self.getSrcForBundle(bundle, wrangler);
            Object.keys(bundleTargets).forEach(function (key) {
                if (bundleTargets.hasOwnProperty(key)) {
                    if (sjl.empty(targets[key])) {
                        targets[key] = [];
                    }
                    targets[key] = targets[key].concat(bundleTargets[key]);
                }
            });
        });

        this.registerGulpTask('', targets, gulp, wrangler);
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
                    bundle.options.alias + '.' + fileType);

                // Build deploy src path
                if (selectedServerEntry.typesAndDeployPathsMap[fileType]) {
                    deployPath = path.join(selectedServerEntry.deployRootFolder,
                        selectedServerEntry.typesAndDeployPathsMap[fileType],
                        bundle.options.alias + '.' + fileType);
                }
                else {
                    deployPath = path.join(selectedServerEntry.deployRootFolder, bundle.options.alias + '.' + fileType);
                }

                // Check if we need styled unix paths and are on windows
                if (deployUsingUnixStylePaths && ((os.type()).toLowerCase()).indexOf('windows') > -1) {
                    deployPath = deployPath.replace(/\\/g, '/');
                }

                // Push array map entry
                srcs[fileType].push([localPath, deployPath]);
            }

            // Check allowedFileType in deploy.otherFiles key
            if (hasDeployOtherFiles && !bundle.has('deploy.otherFiles' + fileType)) {

                // Push array map entry
                srcs[fileType] = self.mapFileArrayToDeployArrayMap(
                    bundle.options.deploy.otherFiles[fileType], fileType,
                    selectedServerEntry, wrangler);
            }
        });

        // Other relative path files
        if (bundle.has('deploy.otherFiles.relative')) {

            // Push array map entry
            srcs['relative'] = self.mapFileArrayToDeployArrayMap(
                bundle.options.deploy.otherFiles['relative'], 'relative',
                    selectedServerEntry, wrangler);
        }

        return srcs;

    },

    mapFileArrayToDeployArrayMap: function (fileArray, fileType,
                                            selectedServerEntry, wrangler) {
        return Array.isArray(fileArray) ? fileArray.map(function (item) {
            var retVal;
            if (selectedServerEntry.typesAndDeployPathsMap[fileType]) {
                retVal = [item, path.join(selectedServerEntry.deployRootFolder, selectedServerEntry.typesAndDeployPathsMap[fileType],
                    path.basename(item))];
            }
            else {
                retVal = [item, path.join(selectedServerEntry.deployRootFolder, item)];
                wrangler.log(item);
            }

            // Check if we need styled unix paths and are on windows
            if (wrangler.tasks.deploy.deployUsingUnixStylePaths && ((os.type()).toLowerCase()).indexOf('windows') > -1) {
                retVal[1] = retVal[1].replace(/\\/g, '/');
            }

            retVal[0] = path.normalize(retVal[0]);

            return retVal;
        }) : [];
    },

    isBundleValidForTask: function (bundle) {
        return bundle && (
            bundle.has('files')
            || (bundle.has('requirejs') || bundle.has('browserify'))
            || bundle.has('deploy.otherFiles') );
    },

    mergeLocalConfigs: function (gulp, wrangler) {
        var localConfigPath = path.join(wrangler.localConfigPath, wrangler.tasks.deploy.localDeployFileName),
            localConfig;
        // Get local deploy config if exists
        if (fs.existsSync(localConfigPath)) {
            localConfig = yaml.safeLoad(fs.readFileSync(localConfigPath));
            sjl.extend(true, wrangler.tasks.deploy, localConfig);
        }
        else {
            // Log a warning
            wrangler.log('\n' + chalk.yellow('Please run the "prompt:deploy" task before ' +
                'attempting to deploy (running the task now).') + '\n', '--mandatory');
            this.localConfigLoadFailed = true;
        }
        return this;
    },

    mkdirpOnServer: function (sftp, dirPath) {
        sftp.mkdir(dirPath, {}, function () {
            console.log(dirPath + ' created');
        });
    }

}); // end of export
