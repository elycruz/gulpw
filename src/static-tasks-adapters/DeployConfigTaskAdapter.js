/**
 * Created by Ely on 1/15/2015.
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var BaseStaticTaskAdapter = require('./BaseStaticTaskAdapter'),
    fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    inquirer = require('inquirer'),
    chalk = require('chalk');

module.exports = BaseStaticTaskAdapter.extend(function DeployConfigTaskAdapter () {
    BaseStaticTaskAdapter.call(this, arguments);
}, {

    registerStaticTask: function (gulp, wrangler) {

        if (wrangler.tasks.deploy.notConfiguredByUser) {
            return;
        }

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
                    return domainToDevelopKey === answers.developingDomain
                        && Array.isArray(domainToDevelop.hostnamePrefixes)
                        && domainToDevelop.hostnamePrefixes.length > 0;
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

        gulp.task('deploy-config', function () {

            // 'Running' message
            console.log(chalk.cyan('Running `deploy-config` task:'));

            return (new Promise(function (fulfill/*, reject*/) {
                inquirer.prompt(questions, function (answers) {
                    var developingDomain = answers.developingDomain || null,
                        domainToDevelop = domainsToDevelop[developingDomain],
                        hostnamePrefixFolders = developingDomain ? domainToDevelop.hostnamePrefixFolders : null,
                        hostnamePrefixFolder = domainToDevelop.hostnamePrefixFolder || '',
                        hostnamePrefix = answers.hostnamePrefix || '',
                        outFileTemplate,
                        newFilePath;

                    // Set hostname prefix folder
                    if (!sjl.empty(hostnamePrefixFolders) && !sjl.empty(hostnamePrefix)) {
                        hostnamePrefixFolder = hostnamePrefixFolders[hostnamePrefix];
                    }

                    // Set out file template
                    outFileTemplate = {
                        developingDomain: developingDomain,
                        hostnamePrefixFolder: hostnamePrefixFolder,
                        hostnamePrefix: hostnamePrefix,
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

                    newFilePath = path.join(process.cwd(),
                        wrangler.localConfigPath, 'deploy.yaml');

                    // Write local deploy config file
                    fs.writeFileSync(newFilePath, yaml.safeDump(outFileTemplate));

                    // 'Completion' message
                    console.log(chalk.cyan('`deploy-config` complete.  ' +
                        'A deployment configuration file has been wrritten to "' + newFilePath + '"'));

                    fulfill();

                }); // end of inquiry

            })); // end of promise

        }); // end of task

        return this;

    } // end of register deploy-config task

});
