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
        var userPath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
            userIdRsaPath = path.normalize(userPath + '/.ssh/id_rsa'),
            questions = [],
            servers = [],
            hosts = wrangler.tasks.deploy.hosts;

        Object.keys(hosts).forEach(function (host) {
            servers = servers.concat(hosts[host].servers);
        });

        questions.push({
            name: 'host',
            type: 'list',
            message: 'Where would you like to deploy?',
            choices: servers
        });

        Object.keys(hosts).forEach(function (hostKey) {
            var host = hosts[hostKey];
            questions.push({
                name: 'site',
                type: 'list',
                message: 'Which application instance would you like to use?',
                choices: host.sites,
                when: function (answers) {
                    return hostKey === answers.host;
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
            message: 'Which questions method would you like to use?',
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
                return fs.existsSync(filepath) ? true : 'The specified file does not exist.';
            },
            when: function (answers) {
                return answers['authType'] === 'publickey';
            }
        });

        questions.push({
            name: 'passphrase',
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
                    tasks: {
                        deploy: {
                            instance: answers.site || null,
                            host: answers.host || null,
                            port: answers.port || null,
                            username: answers.username || null,
                            password: answers.password || null,
                            keyfile: answers.privatekeyLocation || null,
                            passphrase: answers.passphrase || null
                        }
                    }
                };

                // Ensure write path exists
                wrangler.ensurePathExists(path.join(process.cwd(), '.gulpw'));

                // Write local deploy config file
                fs.writeFileSync(path.join(process.cwd(), '.gulpw', 'local.yaml'), yaml.safeDump(outFileTemplate));
            });
        });
    }

});

