/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    os = require('os'),
    path = require('path'),
    fs = require('fs'),
    ssh = require('ssh2'),
    chalk = require('chalk'),
    yaml = require('js-yaml'),
    ejs = require('ejs'),
    glob = require('glob');

module.exports = BaseBundleTaskAdapter.extend(function DeployAdapter (/*config*/) {
    BaseBundleTaskAdapter.apply(this, arguments);
    this._mergeLocalConfigs();

    // If task is runnable resolve template values on it's config
    if (!this.wrangler.tasks.deploy.notConfiguredByUser) {
        this._resolveTemplateValues();
    }

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
                startDeployMessage = ' Deploying ',
                conn = new ssh();

            // Remove possible memory leak messages from within ssh plugin
            conn.setMaxListeners(21);

            return new Promise(function (fulfill, reject) {
                // Get file count
                Object.keys(targets).forEach(function (key, index, list) {
                    if (index < list.length - 1) {
                        startDeployMessage += ', ';
                    }
                    else if (index === list.length -1) {
                        startDeployMessage += ' and ';
                    }
                    startDeployMessage += (key !== 'relative' ? '*.' : '') + key;
                    totalFileCount += targets[key].length;
                });

                startDeployMessage += ' files.\n';

                console.log(chalk.cyan('Running "' + taskName + '" task.\n'));

                startTime = new Date();

                conn.on('ready', function () {

                    console.log(chalk.grey(' Connected to ' + host + '\n'));

                    conn.sftp(function (err, sftp) {

                        if (err) { console.log(chalk.red(' An `ssh2.sftp` error has been encountered:  ' + err + '\n')); }

                        var target,
                            countTimeout;

                        wrangler.log(chalk.grey(startDeployMessage));

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
                                            stateGlyph = sjl.empty(err3) ? chalk.green(' ' + String.fromCharCode(8730)) : chalk.red(' X');

                                        // Show file to be uploaded with state color (passed => green, failed => red
                                        console.log(stateGlyph, item[0]);

                                        // If there was an error uploading the file show it
                                        if (err3) {
                                            stateColor = 'red';
                                            console.log(chalk.red('   An `ssh2.sftp.fastPut` error has occurred:  "' + err3 + '".'));
                                        }

                                        // Show the location the file was uploaded to if in `--verbose` mode
                                        wrangler.log(chalk[stateColor](' => ', item[1]));

                                        // Keep count of the number of files uploaded so far for this session
                                        uploadedFileCount += 1;
                                });
                            });

                        }); // end of files loop

                        countTimeout = setInterval(function () {
                            // @todo make this if check readble (reverse the logic)
                            if (uploadedFileCount >= totalFileCount) {

                                wrangler.log(chalk.cyan('\n File deployment complete.\n'),
                                    chalk.grey('\n Closing connection...'));

                                gulp.tasks[taskName].done = true;

                                conn.end();

                                console.log(chalk.grey('\n Connection closed.\n'));

                                // Log task completion
                                console.log(chalk.cyan(taskName) + chalk.green(' complete') + chalk.cyan('. Duration: ') +
                                    chalk.magenta((new Date() - startTime) / 1000) + 's\n');

                                fulfill();

                                clearInterval(countTimeout);
                            }
                        }, 500);

                    });
                })
                    .on('close', function (hadError) {

                        // If error log it
                        if (hadError) {
                            var errorMsg = 'Connection closed due to an unknown error.\n  ' +
                                'Error received: ' + (sjl.classOfIs(hadError, 'String') ? hadError : '') + '\n';
                            reject(errorMsg);
                            console.log(errorMsg);
                        }
                    })
                    .connect(sshOptions);
            });

        });
    },

    registerBundle: function (bundle, gulp, wrangler) {
        var self = this,
            targets;
        if (self.wrangler.tasks.deploy.notConfiguredByUser) {
            return false;
        }

        targets = self.getSrcForBundle(bundle, wrangler);

        // Register related bundles
        if (bundle.has('relatedBundles.processBefore')) {
            // Inject related bundle srcs into `targets`
            self.getSrcsForBundles(
                wrangler.getBundles(bundle.options.relatedBundles.processBefore),
                targets,
                wrangler);
        }

        this.registerGulpTask(':' + bundle.options.alias, targets, gulp, wrangler);

        return true;
    }, // end of `registerBundle`

    registerBundles: function (bundles, gulp, wrangler) {
        this.registerGulpTask('', this.getSrcsForBundles(bundles, {}, wrangler), gulp, wrangler);
    },

    getSrcsForBundles: function (relatedBundles, targets, wrangler) {
        var self = this;
        targets = targets || {};
        relatedBundles.forEach(function (item) {
            if (!self.isBundleValidForTask(item)) {
                return;
            }
            var subSrcs = self.getSrcForBundle(item, wrangler),
                targetsConcatable = false,
                srcsConcatable;
            Object.keys(subSrcs).forEach(function (key) {
                targetsConcatable = sjl.issetObjKeyAndOfType(targets, key, 'Array');
                srcsConcatable = sjl.issetObjKeyAndOfType(subSrcs, key, 'Array');
                if (targetsConcatable && srcsConcatable) {
                    targets[key] = targets[key].concat(subSrcs[key]);
                }
                else if (!targetsConcatable) {
                    targets[key] = subSrcs[key];
                }
            });
        });
        return targets;
    },

    getSrcForBundle: function (bundle, wrangler) {
        var self = this,
            srcs = {},
            deployOptions = wrangler.tasks.deploy,
            allowedFileTypes = deployOptions.allowedFileTypes,
            selectedServerEntry = deployOptions.domainsToDevelop[deployOptions.developingDomain],
            deployRootFolder = selectedServerEntry.deployRootFolder,
            argvFileTypes = wrangler.getArgvFileTypes(),
            hasArgvFileTypes = wrangler.hasArgvFileTypes(),
            skipArtifacts = wrangler.argv.skipArtifacts,
            isMinifyConfigured = !wrangler.tasks.minify.notConfiguredByUser;

        // Set file type arrays
        allowedFileTypes.forEach(function (fileType) {
            var hasDeployOtherFiles = bundle.has('deploy.otherFiles.' + fileType),
                hasFilesFileType = bundle.has('files.' + fileType),
                deployPath, localPath;

            // Ignore file type if necessary
            if (hasArgvFileTypes && argvFileTypes.indexOf(fileType) === -1) {
                wrangler.log('Ignoring *.' + fileType + ' files.', '--debug');
                return;
            }

            // Check if bundle has files [js, css, allowed file types etc.]
            if (!skipArtifacts && hasFilesFileType && isMinifyConfigured && wrangler.tasks.minify[fileType + 'BuildPath']) {

                // Initialize storage array
                srcs[fileType] = [];

                // Build local src path
                localPath = path.join(wrangler.tasks.minify[fileType + 'BuildPath'],
                    bundle.options.alias + '.' + fileType);

                // Build deploy src path
                if (self._serverEntryHasDeployFolderType(selectedServerEntry, fileType)) {
                    deployPath = path.join(selectedServerEntry.deployRootFoldersByFileType[fileType],
                        localPath);
                }
                else {
                    wrangler.log('Using deploy root path: ', fileType, deployRootFolder, '--debug');
                    deployPath = path.join(deployRootFolder, localPath);
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

    mapFileArrayToDeployArrayMap: function (fileArray, fileType, selectedServerEntry/*, wrangler*/) {
        var self = this, otherFiles = [],
            itemTransformRegexMap = selectedServerEntry.hasOwnProperty('localPathsToServerPathsRegexMap')
                && !sjl.empty(selectedServerEntry.localPathsToServerPathsRegexMap) ?
                selectedServerEntry.localPathsToServerPathsRegexMap : null,
            itemTransformRegexMapKeys = null;

            if (itemTransformRegexMap) {
                itemTransformRegexMapKeys = new Set(Object.keys(itemTransformRegexMap));
            }

        fileArray = Array.isArray(fileArray) ? fileArray : [];

        fileArray = fileArray.filter(function (item) {
            var includeInFileArray;
            if (glob.hasMagic(item)) {
                otherFiles = otherFiles.concat(glob.sync(item));
                includeInFileArray = false;
            }
            else {
                includeInFileArray = true;
            }
            return includeInFileArray;
        });

        return fileArray.concat(otherFiles).map(function (item) {
            var retVal,
                deployItem = item,
                matchedRegex,
                matchedRegexKeyVal;

            if (itemTransformRegexMapKeys !== null && itemTransformRegexMapKeys.size > 0) {
                itemTransformRegexMapKeys.forEach(function (regexItem) {
                    var regex = new RegExp(regexItem);
                    if (regex.test(item)) {
                        matchedRegex = regex;
                        matchedRegexKeyVal = itemTransformRegexMap[regexItem];
                    }
                });

                if (matchedRegex) {
                    deployItem = item.replace(matchedRegex, matchedRegexKeyVal);
                    matchedRegex = matchedRegexKeyVal = null;
                }
            }

            if (self._serverEntryHasDeployFolderType(selectedServerEntry, fileType)) {
                retVal = [item, path.join(selectedServerEntry.deployRootFoldersByFileType[fileType], deployItem)];
            }
            else {
                retVal = [item, path.join(selectedServerEntry.deployRootFolder || '', deployItem)];
            }

            // Check if we need unix styled paths and are on windows
            retVal[1] = self._ensureDeployPathByOs(retVal[1]);

            // Normalize path
            retVal[0] = path.normalize(retVal[0]);

            return retVal;

        });
    },

    isBundleValidForTask: function (bundle) {
        return !this.wrangler.tasks.deploy.notConfiguredByUser
            && bundle && (
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
        //self.wrangler.log(chalk.grey('Ensuring paths exists for "' + filePath + '"'), '--debug');

        pathParts.forEach(function (part) {
            currPath +=  separator + part;

            // Make sure directories exist before trying to put files to them
            sftp.mkdir(currPath, function (/*err2*/) {
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
        var localConfigPath = path.join(this.wrangler.localConfigPath, this.wrangler.staticTasks['deploy-config'].fileName),
            localConfig;

        // Get local deploy config if exists
        if (fs.existsSync(localConfigPath)) {
            localConfig = yaml.safeLoad(fs.readFileSync(localConfigPath));
            sjl.extend(true, this.wrangler.tasks.deploy, localConfig);
        }
        else {
            // Make task skippable
            this.wrangler.tasks.deploy.notConfiguredByUser = true;

            // Log a warning
            console.log(chalk.yellow('! Please run the "deploy-config" task before ' +
                'attempting to deploy.  Attempted to load path: ' + localConfigPath + ' but path doesn\'t exist.\n'));
            //throw new Error('Could not run the deploy task due to missing config file.');
            //if (!this.wrangler.argv.force) {
                //process.exit(0);
            //}
        }
        return this;
    },

    _resolveTemplateValues: function (deployOptions) {

        deployOptions = deployOptions || this.wrangler.tasks.deploy;

        var selectedServerEntry = deployOptions.domainsToDevelop[deployOptions.developingDomain];

        if (selectedServerEntry.deployRootFolder) {
            selectedServerEntry.deployRootFolder =
                    ejs.compile(selectedServerEntry.deployRootFolder)(deployOptions);
        }

        if (!sjl.empty(selectedServerEntry.deployRootFoldersByFileType)) {
                Object.keys(selectedServerEntry.deployRootFoldersByFileType).forEach(function (key) {
                        selectedServerEntry.deployRootFoldersByFileType[key] =
                            ejs.compile(selectedServerEntry.deployRootFoldersByFileType[key])(deployOptions);
                    });
        }
        return this;
    },

    _serverEntryHasDeployFolderType: function (serverEntry, fileType) {
        return sjl.classOfIs(serverEntry.deployRootFoldersByFileType, 'Object') && serverEntry.deployRootFoldersByFileType[fileType];
    }

}); // end of export
