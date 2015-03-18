/**
 * Created by edelacruz on 11/19/2014.
 */

'use strict';

require('sjljs');

require('es6-promise').polyfill();

// Import base task proxy to extend
var WranglerTaskAdapter = require('../WranglerTaskAdapter'),
    fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    inquirer = require('inquirer'),
    chalk = require('chalk');

module.exports = WranglerTaskAdapter.extend(function PromptAdapter (options) {
    WranglerTaskAdapter.call(this, options);
}, {

    registerStaticTasks: function (gulp, wrangler) {
        var self = this;
        self.registerDeployTask(gulp, wrangler)
            .registerConfigTask(gulp, wrangler);
    },

    registerDeployTask: function (gulp, wrangler) {
        var userPath = process.env.HOME || process.env.HOMEPATH
                || process.env.USERPROFILE,
            userIdRsaPath = path.normalize(userPath + '/.ssh/id_rsa'),
            questions = [],
            domainsToDevelop = wrangler.tasks.deploy.domainsToDevelop;

        questions.push({
            name: 'developingDomain',
            type: 'list',
            message: 'What domain key would you like to develop for?',
            choices: Object.keys(domainsToDevelop)
        });

        Object.keys(domainsToDevelop).forEach(function (domainToDevelopKey) {
            var domainToDevelop = domainsToDevelop[domainToDevelopKey];

            questions.push({
                name: 'hostname',
                type: 'list',
                message: 'What server would you like to deploy to?',
                choices: domainToDevelop.hostnames,
                when: function (answers) {
                    return domainToDevelopKey === answers.developingDomain;
                }
            });

            questions.push({
                name: 'hostnamePrefix',
                type: 'list',
                message: 'Which host prefix would you like to use?',
                choices: domainToDevelop.hostnamePrefixes,
                when: function (answers) {
                    return domainToDevelopKey === answers.developingDomain;
                }
            });

            questions.push({
                name: 'hostnamePrefixFolder',
                type: 'list',
                message: 'Which host prefix folder would you like to use?',
                choices: (function () {
                    return Object.keys(domainToDevelop.hostnamePrefixFolders).map(function (key) {
                        return domainToDevelop.hostnamePrefixFolders[key];
                    });
                }),
                when: function (answers) {
                    return domainToDevelopKey === answers.developingDomain && !sjl.empty(domainToDevelop.hostnamePrefixFolders);
                }
            });
        });

        questions.push({
            name: 'port',
            type: 'input',
            message: 'Which network port would you like to use?',
            default: 22
        });

        questions.push({
            name: 'authType',
            type: 'list',
            message: 'How would you like to login to server?',
            choices: ['publickey', 'password']
        });

        questions.push({
            name: 'username',
            type: 'input',
            message: 'What is your username?',
            default: 'admin',
            validate: function (username) {
                return username ? true : 'Please enter your username.';
            }
        });

        questions.push({
            name: 'password',
            type: 'password',
            message: 'What is your password',
            validate: function (password) {
                return password ? true : 'Please enter your password.';
            },
            when: function (answers) {
                return answers.authType === 'password';
            }
        });

        questions.push({
            name: 'privateKeyLocation',
            type: 'input',
            message: 'Where is your SSH private key?',
            default: userIdRsaPath,
            validate: function (filepath) {
                return fs.existsSync(filepath) ? true :
                    'The specified file does not exist.';
            },
            when: function (answers) {
                return answers.authType === 'publickey';
            }
        });

        questions.push({
            name: 'publickeyPassphrase',
            type: 'password',
            message: 'What is your SSH passphrase?',
            default: '',
            when: function (answers) {
                return answers.authType === 'publickey';
            }
        });

        gulp.task('prompt:deploy', function () {

            return (new Promise(function (fulfill, reject) {

                inquirer.prompt(questions, function (answers) {
                    var outFileTemplate = {
                        developingDomain: answers.developingDomain || null,
                        hostnamePrefixFolder: answers.hostnamePrefixFolder || null,
                        hostnamePrefix: answers.hostnamePrefix || null,
                        hostname: answers.hostname || null,
                        port: answers.port || null,
                        username: answers.username || null,
                        password: answers.password || null,
                        privatekeyLocation: answers.privateKeyLocation || null,
                        publickeyPassphrase: answers.publickeyPassphrase || null
                    };

                    // Ensure write path exists
                    wrangler.ensurePathExists(
                        path.join(process.cwd(), wrangler.localConfigPath));

                    // Write local deploy config file
                    fs.writeFileSync(path.join(process.cwd(),
                        wrangler.localConfigPath,
                        wrangler.tasks.deploy.localDeployFileName),
                        yaml.safeDump(outFileTemplate) );

                }); // end of inquiry

            })); // end of promise

        }); // end of task

        return this;

    }, // end of register prompt:deploy task

    registerConfigTask: function (gulp, wrangler) {
        var taskKeys = Object.keys(wrangler.tasks),
            questions = [
            {
                name: 'configFormat',
                type: 'list',
                message: 'In what format would you like your config outputted?',
                choices: [
                    '.json',
                    '.yaml'
                ]
            },
            {
                name: 'tasks',
                type: 'checkbox',
                //defaults: taskKeys,
                message: 'Please deselect the tasks you don\'t plan on initially configuring from you newly generated bundle wrangler config file?',
                choices: taskKeys
            }
        ];

        gulp.task('prompt:config', function () {
            return (new Promise(function (fulfill, reject) {

                console.log(chalk.cyan('Running "prompt:config" task.\n\n') +
                    chalk.dim('** Note ** - Any existing config will be backed up to "' + wrangler.localConfigBackupPath + '" before generating a new one.'));

                inquirer.prompt(questions, function (answers) {
                    var newConfig = wrangler.loadConfigFile(path.join(__dirname, '/../../../configs/default.wrangler.config.yaml')),
                        newConfigPath = null,
                        oldConfig = wrangler.loadConfigFile(wrangler.configPath),
                        oldFileName = path.basename(wrangler.configPath),
                        oldFileExt = path.extname(oldFileName),
                        backupPath = path.join(process.cwd(), wrangler.localConfigBackupPath),
                        backupFilePath = path.join(backupPath, oldFileName),
                        tmpFileName,
                        tmpPathName,
                        jsonSpace = '     ';

                    // Ensure backup file path exists
                    wrangler.ensurePathExists(backupPath);

                    // If backup file already exists create a timestamped version name
                    if (fs.existsSync(backupFilePath)) {
                        tmpFileName = path.basename(oldFileName, oldFileExt);
                        tmpFileName += '--' + (new Date()).getTime();
                        backupFilePath = path.join(backupPath, tmpFileName + (oldFileExt === '.json' || oldFileExt === '.js' ? '.json' : '.yaml'));
                    }

                    // Get the content to backup based on file type
                    if (oldFileExt === '.json' || oldFileExt === '.js') {
                        oldConfig = JSON.stringify(oldConfig, null, jsonSpace);
                    }
                    else {
                        oldConfig = yaml.safeDump(oldConfig);
                    }

                    // Backup current config file
                    fs.writeFileSync(backupFilePath, oldConfig);

                    // 'Backup complete' message
                    console.log(chalk.dim('\nOld config backed up successfully to "' + backupFilePath + '".\n'));

                    // Remove sections that were not specified to be kept by the user
                    taskKeys.forEach(function (key) {
                        if (answers.tasks.indexOf(key) === -1) {
                            newConfig.tasks[key] = null;
                            delete newConfig.tasks[key];
                        }
                    });

                    // Get new config's contents
                    newConfig = answers.configFormat === '.json' ?
                        JSON.stringify(newConfig, null, jsonSpace) : yaml.safeDump(newConfig);

                    // Get new config path
                    tmpPathName = path.dirname(wrangler.configPath);
                    // @todo No hard coding allowed (This is here temporarily because of a bug).
                    tmpFileName = 'bundle.wrangler.config'; //path.basename(wrangler.configPath, answers.configFormat);
                    newConfigPath = path.join(tmpPathName, tmpFileName + answers.configFormat);

                    // Write new config file
                    fs.writeFileSync(newConfigPath, newConfig);

                    // 'New config written successfully' message
                    console.log(chalk.dim('New config file written to "' + newConfigPath + '".'));

                    // Fullfill promise
                    fulfill();

                }); // end of inquiry

            })); // end of promise

        }); // end of task

        return this;

    } // end of register prompt:config task

});
