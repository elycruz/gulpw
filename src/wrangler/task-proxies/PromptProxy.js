/**
 * Created by edelacruz on 11/19/2014.
 */
require('sjljs');

// Import base task proxy to extend
var WranglerTaskProxy = require('../WranglerTaskProxy'),
    fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    inquirer = require('inquirer');

module.exports = WranglerTaskProxy.extend(function PromptProxy (options) {
    WranglerTaskProxy.call(this, options);
}, {

    registerStaticTasks: function (gulp, wrangler) {
        var self = this;
        self.registerDeployTask(gulp, wrangler);
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
                name: 'devHostname',
                type: 'list',
                message: 'What server would you like to deploy to?',
                choices: domainToDevelop.devHostnames,
                when: function (answers) {
                    return domainToDevelopKey === answers.developingDomain
                }
            });

            questions.push({
                name: 'devHostnamePrefix',
                type: 'list',
                message: 'Which host prefix would you like to use?',
                choices: domainToDevelop.devHostnamePrefixes,
                when: function (answers) {
                    return domainToDevelopKey === answers.developingDomain;
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
                return answers['authType'] === 'password';
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
                return answers['authType'] === 'publickey';
            }
        });

        questions.push({
            name: 'publickeyPassphrase',
            type: 'password',
            message: 'What is your SSH passphrase?',
            default: '',
            when: function (answers) {
                return answers['authType'] === 'publickey';
            }
        });

        gulp.task('prompt:deploy', function () {
            inquirer.prompt(questions, function (answers) {
                var outFileTemplate = {
                    developingDomain: answers.developingDomain || null,
                    devHostnamePrefix: answers.devHostnamePrefix || null,
                    devHostname: answers.devHostname || null,
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
            });
        });
    }

});

