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
    lodash = require('lodash'),
    glob = require('glob');

module.exports = TaskProxy.extend(function DeployProxy (config) {
    TaskProxy.apply(this, arguments);
    this._mergeLocalConfigs()
        ._resolveTemplateValues();
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

            // Remove possible memory leak messages from within ssh plugin
            conn.setMaxListeners(21);

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

                wrangler.log('\n DeployProxy -> targets\n', targets, '--debug');

                conn.on('ready', function () {

                    wrangler.log(chalk.dim('\n Connected to ' + host), '--mandatory');

                    conn.sftp(function (err, sftp) {

                        if (err) { console.log(chalk.red(' An `ssh2.sftp` error has been encountered:  ' + err), '--mandatory'); }

                        var target;

                        wrangler.log('\n', chalk.grey(startDeployMessage), '\n');

                        // Loop through all target keys in targets
                        Object.keys(targets).forEach(function (key) {

                            // Get file pair ([local-file, server-file])
                            target = targets[key];

                            // Loop through files and upload them
                            target.forEach(function (item) {

                                // Make sure directories exist before trying to put files to them
                                self._ensurePathExistsOnServer(sftp, path.dirname(item[1]));

                                // Put file to server
                                sftp.fastPut(item[0], item[1], function (err3) {
                                        // File Put state
                                        var stateColor = 'green',

                                            // An 'X' or a check mark depending on if there was an error uploading the file or not
                                            stateGlyph = sjl.empty(err3) ? chalk.green(' ' + String.fromCharCode(8730)) : chalk.red('X');

                                        // Show file to be uploaded with state color (passed => green, failed => red
                                        wrangler.log(stateGlyph, item[0], '--mandatory');

                                        // If there was an error uploading the file show it
                                        if (err3) { stateColor = 'red'; wrangler.log(
                                            chalk.red(' An `ssh2.sftp.fastPut` error has occurred:  ' + err3), '--mandatory'); }

                                        // Show the location the file was uploaded to if in `--verbose` mode
                                        wrangler.log(chalk[stateColor](' => ', item[1]));

                                        // Keep count of the number of files uploaded so far for this session
                                        uploadedFileCount += 1;
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
                        else {
                            reject('Connection closed.');
                            wrangler.log('\n Connection closed.', '--mandatory');
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
            selectedServerEntry = deployOptions.domainsToDevelop[deployOptions.developingDomain],
            deployRootFolder = selectedServerEntry.deployRootFolder,
            argvFileTypes = wrangler.getArgvFileTypes(),
            hasArgvFileTypes = !sjl.empty(argvFileTypes);

        // Set file type arrays
        allowedFileTypes.forEach(function (fileType) {
            var hasDeployOtherFiles = bundle.has('deploy.otherFiles.' + fileType),
                hasFilesFileType = bundle.has('files.' + fileType),
                deployPath, localPath;

            // could've used array_diff between allowedFileTypes and argvFileTypes for this but
            // may be more performant/cpu-intensive on cpu @todo take a look at this
            // Ignore file type if necessary
            if (hasArgvFileTypes && argvFileTypes.indexOf(fileType) === -1) {
                wrangler.log('Ignoring *.' + fileType + ' files.', '--debug');
                return;
            }

            // Check if bundle has files [js, css, allowed file types etc.]
            if (hasFilesFileType && wrangler.tasks.minify[fileType + 'BuildPath']) {

                // Initialize storage array
                srcs[fileType] = [];

                // Build local src path
                localPath = path.join(wrangler.tasks.minify[fileType + 'BuildPath'],
                    bundle.options.alias + '.' + fileType);

                // Build deploy src path
                if (self._serverEntryHasDeployFolderType(selectedServerEntry, fileType)) {
                    deployPath = path.join(selectedServerEntry.deployRootFoldersByFileType[fileType],
                        bundle.options.alias + '.' + fileType);
                }
                else {
                    deployPath = path.join(deployRootFolder, bundle.options.alias + '.' + fileType);
                }

                // Check if we need unix styled paths and are on windows
                deployPath = self._ensureDeployPathByOs(deployPath);

                // Push array map entry
                srcs[fileType].push([localPath, deployPath]);
            }

            // Check allowedFileType in deploy.otherFiles key
            if (hasDeployOtherFiles && bundle.has('deploy.otherFiles.' + fileType)) {

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

            // Filter relative sources if argv.fileTypes is populated
            if (hasArgvFileTypes) {
                srcs.relative = srcs.relative.filter(function (item) {
                    return argvFileTypes.indexOf(path.extname(item[0]).split('.')[1]) > -1;
                });
            }
        }

        return srcs;
    },

    mapFileArrayToDeployArrayMap: function (fileArray, fileType, selectedServerEntry, wrangler) {
        var self = this, otherFiles = [];

        fileArray = Array.isArray(fileArray) ? fileArray : [];

        fileArray = fileArray.filter(function (item) {
            if (glob.hasMagic(item)) {
                otherFiles = otherFiles.concat(glob.sync(item));
                return false;
            }
            else {
                return true;
            }
        });

        return fileArray.concat(otherFiles).map(function (item) {
            var retVal;

            if (self._serverEntryHasDeployFolderType(selectedServerEntry, fileType)) {
                retVal = [item, path.join(selectedServerEntry.deployRootFoldersByFileType[fileType], item)];
            }
            else {
                retVal = [item, path.join(selectedServerEntry.deployRootFolder || '', item)];
            }

            // Check if we need unix styled paths and are on windows
            retVal[1] = self._ensureDeployPathByOs(retVal[1]);

            // Normalize path
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

    _ensureDeployPathByOs: function (value) {
        value = value || '';
        if (this.wrangler.tasks.deploy.deployUsingUnixStylePaths && ((os.type()).toLowerCase()).indexOf('windows') > -1) {
            value = value.replace(/\\/g, '/');
        }
        return value;
    },

    _ensurePathExistsOnServer: function (sftp, filePath) {
        var self = this,
            usingUnixPaths = self.wrangler.tasks.deploy.deployUsingUnixStylePaths,
            separator = usingUnixPaths ? '/' : '\\',
            pathParts = filePath.split(usingUnixPaths ? '/' : '\\'),
            currPath = '';

        // Remove empty parts
        pathParts.forEach(function (part, i, arr) {
            if (part.length === 0) {
                arr[i] = null;
                delete arr[i];
            }
        });

        // Log debug message
        self.wrangler.log(chalk.grey('Ensuring paths exists for "' + filePath + '"'), '--debug');

        pathParts.forEach(function (part) {
            currPath +=  separator + part;

            // Make sure directories exist before trying to put files to them
            sftp.mkdir(currPath, function (err2) {
                // If error do nothing since `mkdir` will complain about directory if it already
                // exists (we just want to ensure that the path already exists before trying to upload the file)
                //if (err2) {
                //wrangler.log(chalk.red(' An `mkdir -p` error has occurred:  ' + err2, path.dirname(item[1])));
                //}
            });
        });

        return sftp;
    },

    _mergeLocalConfigs: function () {
        // @todo don't forget to change this (hardcoded value)
        var localConfigPath = path.join(this.wrangler.localConfigPath, 'deploy.yaml'),
            localConfig;

        // Get local deploy config if exists
        if (fs.existsSync(localConfigPath)) {
            localConfig = yaml.safeLoad(fs.readFileSync(localConfigPath));
            sjl.extend(true, this.wrangler.tasks.deploy, localConfig);
        }
        else {
            // Log a warning
            this.wrangler.log('\n' + chalk.yellow('Please run the "deploy-config" task before ' +
                'attempting to deploy (running the task now).') + '\n', '--mandatory');
        }
        return this;
    },

    _resolveTemplateValues: function (deployOptions) {

        deployOptions = deployOptions || this.wrangler.tasks.deploy;

        var selectedServerEntry = deployOptions.domainsToDevelop[deployOptions.developingDomain];

        if (selectedServerEntry.deployRootFolder) {
            selectedServerEntry.deployRootFolder =
                    lodash.template(selectedServerEntry.deployRootFolder, deployOptions);
        }

        if (!sjl.empty(selectedServerEntry.deployRootFoldersByFileType)) {
                Object.keys(selectedServerEntry.deployRootFoldersByFileType).forEach(function (key) {
                        selectedServerEntry.deployRootFoldersByFileType[key] =
                            lodash.template(selectedServerEntry.deployRootFoldersByFileType[key], deployOptions);
                    });
        }
        return this;
    },

    _serverEntryHasDeployFolderType: function (serverEntry, fileType) {
        return sjl.classOfIs(serverEntry.deployRootFoldersByFileType, 'Object') && serverEntry.deployRootFoldersByFileType[fileType];
    }

}); // end of export
