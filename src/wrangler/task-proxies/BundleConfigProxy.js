/**
 * Created by Ely on 1/15/2015.
 */
/**
 * Created by Ely on 1/15/2015.
 */

/**
 * Created by edelacruz on 11/19/2014.
 */

'use strict';

require('sjljs');

require('es6-promise').polyfill();

// Import base task proxy to extend
var WranglerTaskProxy = require('../WranglerTaskProxy'),
    fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    inquirer = require('inquirer'),
    lodash = require('lodash'),
    chalk = require('chalk');

module.exports = WranglerTaskProxy.extend(function BundleConfigProxy (options) {
    WranglerTaskProxy.call(this, options);
}, {

    registerStaticTasks: function (gulp, wrangler) {
        var taskKeys = Object.keys(wrangler.tasks),
            otherTaskKeys = lodash.difference(taskKeys, ['all', 'minify', 'concat', 'requirejs', 'browserify']),
            questions = [
                {
                    name: 'configFormat',
                    type: 'list',
                    message: 'In what format would you like your bundle config outputted in?',
                    choices: [
                        '.json',
                        '.yaml'
                    ]
                },
                {
                    name: 'alias',
                    type: 'input',
                    message: 'What is your bundle\'s alias name (/^[a-z]+[a-z\-\d_]+$/i)?',
                    validate: function (value) {
                        return /^[a-z]+[a-z\-\d_]+$/i.test(value) ?
                            true : 'The bundle name is in an incorrect format.  Value received: ' + value;
                    }
                },
                {
                    name: 'version',
                    type: 'input',
                    message: 'Version number (recommended: SemVer)(optional):'
                },
                {
                    name: 'description',
                    type: 'input',
                    message: 'Describe your bundle (optional):'
                },
                {
                    name: 'useAmdOrUmd',
                    type: 'confirm',
                    default: false,
                    message: 'Would you like to configure an AMD or UMD task from your bundle?'
                },
                {
                    name: 'amdOrUmd',
                    type: 'list',
                    message: 'Select your AMD or UMD task:',
                    list: ['requirejs', 'browserify'],
                    when: function (answers) {
                        return answers.useAmdOrUmd;
                    }
                },
                {
                    name: 'useMinifyAndConcat',
                    type: 'confirm',
                    default: false,
                    message: 'Would you like to concatenate or minify separate *.js, *.css, *.html, and/or template files from your bundle?'
                },
                {
                    name: 'minifyAndConcat',
                    type: 'checkbox',
                    choices: ['js', 'css', 'html', 'mustache'],
                    message: 'Choose file types you would like to concatenate from your bundle file:',
                    when: function (answers) {
                        return answers.useMinifyAndConcat;
                    }
                },
                {
                    name: 'otherTasks',
                    type: 'checkbox',
                    message: 'Choose any other tasks you would like to configure from your bundle file:',
                    choices: otherTaskKeys
                }
            ];


        gulp.task('bundle-config', function () {
            return (new Promise(function (fulfill, reject) {

                console.log(chalk.cyan('Running "bundle-config" task.\n\n'));

                inquirer.prompt(questions, function (answers) {
                    var newConfig = {
                            alias: answers.alias,
                            description: answers.description,
                            version: answers.version
                        },
                        exampleConfig = wrangler.loadConfigFile(path.join(__dirname, '/../../../configs/default.bundle-template.yaml')),
                        jsonSpace = '     ',
                        bundlesPath = path.join(process.cwd(), wrangler.bundlesPath),
                        bundlePath = path.join(bundlesPath, answers.alias + answers.configFormat);

                    // Ensure bundles path exists
                    wrangler.ensurePathExists(bundlesPath);

                    // If bundle file already exists exit
                    if (fs.existsSync(bundlePath)) {
                        console.log(chalk.yellow('A bundle with that name already exists at ""'));
                        return;
                    }

                    // Files hash
                    if (answers.minifyAndConcat.length > 0) {
                        newConfig.files = {};
                        answers.minifyAndConcat.forEach(function (key) {
                           newConfig[key] = [];
                        });
                    }

                    // AMD and/or UMD
                    if (answers.useAmdOrUmd) {
                        newConfig[answers.amdOrUmd] = {options: {}};
                    }

                    // Other tasks
                    if (answers.otherTasks.length > 0) {
                        answers.otherTasks.forEach(function (key) {
                            newConfig[key] = exampleConfig[key];
                        });
                    }

                    // Get new config's contents
                    newConfig = answers.configFormat === '.json' ?
                        JSON.stringify(newConfig, null, jsonSpace) : yaml.safeDump(newConfig);

                    // Write new config file
                    fs.writeFileSync(bundlePath, newConfig);

                    // 'New config written successfully' message
                    console.log(chalk.dim('New bundle config file written to "' + newConfigPath + '".'));

                    // Fullfill promise
                    fulfill();

                }); // end of inquiry

            })); // end of promise

        }); // end of task

    } // end of register 'config' task

});
