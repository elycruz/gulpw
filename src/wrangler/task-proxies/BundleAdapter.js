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
var WranglerTaskAdapter = require('../WranglerTaskAdapter'),
    fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    inquirer = require('inquirer'),
    lodash = require('lodash'),
    chalk = require('chalk');

module.exports = WranglerTaskAdapter.extend(function BundleAdapter (options) {
    WranglerTaskAdapter.call(this, options);
}, {

    registerStaticTasks: function (gulp, wrangler) {
        var bundleConfig = wrangler.staticTasks.bundle,
            otherTaskKeys = bundleConfig.allowedTasks,

            questions = [
                {
                    name: 'configFormat',
                    type: 'list',
                    message: 'Choose a bundle config format:',
                    choices: [
                        '.json',
                        '.yaml'
                    ]
                },
                {
                    name: 'alias',
                    type: 'input',
                    message: 'Input name for bundle file:',
                    validate: function (alias) {
                        if (!/^[a-z]+[a-z\-\d_]+$/i.test(alias)) {
                            return 'The bundle name format is invalid.  Only [a-z,0-9,-,_,.] allowed.  Value received: ' + alias;
                        }
                        else if (fs.existsSync(path.join(wrangler.bundlesPath, alias + '.json'))
                            || fs.existsSync(path.join(wrangler.bundlesPath, alias + '.yaml'))) {
                            return 'A bundle file with that name "' + alias + '" already exists.  Try a different name.';
                        }
                        return true;
                    }
                },
                {
                    name: 'description',
                    type: 'input',
                    message: 'Describe your bundle (optional):'
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
                            version: '0.0.0',
                            description: ''
                        },
                        exampleConfig = wrangler.loadConfigFile(path.join(__dirname, '/../../../', bundleConfig.emptyBundleFile)),
                        jsonSpace = '     ',
                        bundlePath = path.join(wrangler.bundlesPath, answers.alias + answers.configFormat);

                    // Ensure bundles path exists
                    wrangler.ensurePathExists(wrangler.bundlesPath);

                    // Files hash
                    if (answers.useMinifyAndConcat &&
                        answers.minifyAndConcat &&
                        answers.minifyAndConcat.length > 0) {
                        newConfig.files = {};
                        answers.minifyAndConcat.forEach(function (key) {
                           newConfig.files[key] = [];
                        });
                    }

                    // Other tasks
                    if (answers.otherTasks && answers.otherTasks.length > 0) {
                        answers.otherTasks.forEach(function (key) {
                            newConfig[key] = exampleConfig[key];
                        });
                    }

                    // Get new config's contents
                    newConfig = answers.configFormat === '.json' ?
                        JSON.stringify(newConfig, null, jsonSpace) : yaml.safeDump(newConfig);

                    console.log('Generated file:', chalk.grey(bundlePath), newConfig, '\n');

                    // Write new config file
                    fs.writeFileSync(bundlePath, newConfig);

                    // 'New config written successfully' message
                    console.log(chalk.dim('New bundle config file written to "' + bundlePath + '".\n'));

                    // Fullfill promise
                    fulfill();

                }); // end of inquiry

            })); // end of promise

        }); // end of task

    } // end of register 'config' task

});
