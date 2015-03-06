/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */

'use strict';

require('sjljs');
require('es6-promise').polyfill();

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
    os = require('os'),
    path = require('path'),
    fs = require('fs'),
    ssh = require('ssh2'),
    chalk = require('chalk'),
    yaml = require('js-yaml'),
    lodash = require('lodash');

    //gutil = require('gulp-util');

module.exports = TaskProxy.extend(function DeployProxy (config) {
    TaskProxy.call(this, config);
}, {

    registerGulpTask: function (taskPrefix, targets, gulp, wrangler) {
        var self = this,
            deployOptions = wrangler.tasks.deploy,
            host = deployOptions.hostnamePrefix + deployOptions.hostname,
            sshOptions = {
                host: host,
                username: deployOptions.username,
                password: deployOptions.password,
                port: deployOptions.port
            },
            taskName = 'deploy' + (taskPrefix || ''),
            startTime;

        gulp.task(taskName, function () {
            var totalFileCount = 0,
                uploadedFileCount = 0,
                startDeployMessage = 'Deploying ',
                conn = new ssh();

            return (new Promise(function (fulfill, reject) {
                // Get file count
                Object.keys(targets).forEach(function (key, index, list) {
                    startDeployMessage += (index === 0 ? '' :
                        (index < list.length - 1 ? ', ' : ' and ')) + (key !== 'relative' ? '*.' : '') + key;
                    totalFileCount += targets[key].length;
                });

                startDeployMessage += ' files.';

                wrangler.log('\n', 'Running ' + chalk.cyan('"' + taskName + '"') + ' task.', '--mandatory');

                startTime = new Date();

                //console.log('DeployProxy -> targets\n', targets);

                conn.on('ready', function () {

                    wrangler.log(chalk.dim('\n Connected to ' + host), '--mandatory');

                    // Make sure directories exist

                    conn.sftp(function (err, sftp) {

                        if (err) { console.log(err); }

                        var target;

                        wrangler.log('\n', chalk.grey(startDeployMessage), '\n');

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
                                            wrangler.log(chalk.green(' ' + String.fromCharCode(8730)), item[0], '--mandatory');
                                            wrangler.log(chalk.green(' => ', item[1]));
                                            if (err3) { console.log(err3); }
                                            uploadedFileCount += 1;
                                        });
                                });

                            });

                        }); // end of files loop

                        var countTimeout = setInterval(function () {
                            // @todo make this if check readble (reverse the logic)
                            if (totalFileCount <= uploadedFileCount) {

                                wrangler.log(chalk.cyan('\n File deployment complete.'),
                                    chalk.grey('\n\n Closing connection...'));

                                // Log task completion
                                wrangler.log('\n', chalk.cyan(taskName) + chalk.green(' complete') + chalk.cyan('. Duration: ') +
                                chalk.magenta((((new Date()) - startTime) / 1000) + 's\n'), '--mandatory');

                                gulp.tasks[taskName].done = true;

                                conn.end();

                                wrangler.log('Connection closed.', '--mandatory');

                                fulfill();

                                clearInterval(countTimeout);
                            }
                        }, 500);

                    });

                })
                    .on('close', function (hadError) {

                        // If error log it
                        if (hadError) {
                            reject('Connection closed due to an unknown error.  Error received: ' + (sjl.classOfIs(hadError, 'String') ? hadError : ''));
                            wrangler.log('\n Connection closed due to an unknown error.', '--mandatory');
                        }
                    })
                    .connect(sshOptions);
            }));

        });
    },

    registerBundle: function (bundle, gulp, wrangler) {

        // If bundle is not valid for task, bail
        if (!this.isBundleValidForTask(bundle)) {
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
console.log('here');
        this.mergeLocalConfigs(gulp, wrangler);

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
            selectedServerEntry = deployOptions.domainsToDevelop[deployOptions.developingDomain],
            // @todo this parsing and setting of `deployRootFolder` shouldn't happen here (happening here temporarily)
            deployRootFolder = '';

        // Check if
        if (selectedServerEntry.deployRootFolder) {
            deployRootFolder =
                selectedServerEntry.deployRootFolder =
                    lodash.template(selectedServerEntry.deployRootFolder, deployOptions);
        }

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
                if (selectedServerEntry.useDeployRootFoldersByFileType && selectedServerEntry.deployRootFoldersByFileType[fileType]) {
                    deployPath = path.join(
                        lodash.template(selectedServerEntry.deployRootFoldersByFileType[fileType], deployOptions),
                        bundle.options.alias + '.' + fileType);
                }
                else {
                    deployPath = path.join(deployRootFolder, bundle.options.alias + '.' + fileType);
                }

                // Check if we need unix styled paths and are on windows
                if (deployUsingUnixStylePaths && ((os.type()).toLowerCase()).indexOf('windows') > -1) {
                    deployPath = deployPath.replace(/\\/g, '/');
                }

                // Push array map entry
                srcs[fileType].push([localPath, deployPath]);
            }

            // Check allowedFileType in deploy.otherFiles key
            if (hasDeployOtherFiles && !bundle.has('deploy.otherFiles.' + fileType)) {

                // Push array map entry
                srcs[fileType] = self.mapFileArrayToDeployArrayMap(
                    bundle.options.deploy.otherFiles[fileType], fileType,
                    selectedServerEntry, wrangler);
            }
        });

        // Other relative path files
        if (bundle.has('deploy.otherFiles.relative')) {

            // Push array map entry
            srcs.relative = self.mapFileArrayToDeployArrayMap(
                bundle.options.deploy.otherFiles.relative, 'relative',
                    selectedServerEntry, wrangler);
        }

        return srcs;

    },

    mapFileArrayToDeployArrayMap: function (fileArray, fileType, selectedServerEntry, wrangler) {
        return Array.isArray(fileArray) ? fileArray.map(function (item) {
            var retVal,
                deployOptions = wrangler.tasks.deploy;
            if (selectedServerEntry.useDeployRootFoldersByFileType && selectedServerEntry.deployRootFoldersByFileType[fileType]) {
                retVal = [item, path.join(
                                    lodash.template(selectedServerEntry.deployRootFoldersByFileType[fileType], deployOptions),
                                    path.basename(item))];
            }
            else {
                retVal = [item, path.join(selectedServerEntry.deployRootFolder || '', item)];
            }

            // Check if we need unix styled paths and are on windows
            if (wrangler.tasks.deploy.deployUsingUnixStylePaths && ((os.type()).toLowerCase()).indexOf('windows') > -1) {
                retVal[1] = retVal[1].replace(/\\/g, '/');
            }

            // Normalize path
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

    // @todo throw an error when load fails here
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
            wrangler.log('\n' + chalk.yellow('Please run the "deploy-config" task before ' +
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
    //
    //getSshConnection: function () {
    //    var conn = this.sshConnection;
    //    if (!sjl.isset(conn)) {
    //        conn = this.sshConnection = new ssh();
    //    }
    //    return conn;
    //}

}); // end of export
