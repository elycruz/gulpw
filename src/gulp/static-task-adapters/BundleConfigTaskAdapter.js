/**
 * Created by elydelacruz on 2/3/16.
 * @note Ported from older version.  May be due for a refactor.
 */

'use strict';

// Import base task proxy to extend
let sjl = require('sjljs'),
    fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    inquirer = require('inquirer'),
    chalk = require('chalk'),
    gwUtils = require('../../Utils'),
    Bundle = require('../../Bundle'),
    StaticTaskAdapter = require('./../../StaticTaskAdapter');

/**
 * @class BundleConfigTaskAdapter
 */
class BundleConfigTaskAdapter extends StaticTaskAdapter {

    constructor(config) {
        super();

        let contextName = 'gulpw.gulp.static-task-adapters.BundleConfigTaskAdapter';
         var _emptyBundleFilePath = '',
            _allowedTaskNames = [];

        // Augment config
        Object.defineProperties(this.config, {
            emptyBundleFilePath: {
                get: function () {
                    return _emptyBundleFilePath;
                },
                set: function (value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, 'emptyBundleFilePath', value, String.name);
                    _emptyBundleFilePath = value;
                }
            },
            allowedTaskNames: {
                get: function () {
                    return _allowedTaskNames;
                },
                set: function (value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, 'allowedTaskNames', value, Array.name);
                    _allowedTaskNames = value;
                }
            }
        });

        // Set config
        this.config = config;
    }

    register (taskManager) {
        console.log(process.argv);
        var config = this.config,
            otherTaskKeys = config.allowedTaskNames.filter(taskName => taskManager.availableTaskNames.has(taskName)),
            defaultBundleName = process.argv.length >= 5 ? process.argv[4] : 'bundle',
            questions = [
                {
                    name: 'configFormat',
                    type: 'list',
                    message: 'Choose a bundle config format:',
                    choices: [
                        '.json',
                        '.yaml',
                        '.yml',
                        '.js'
                    ]
                },
                {
                    name: 'alias',
                    type: 'input',
                    message: 'Input name for bundle file:',
                    default: defaultBundleName,
                    validate: function (alias) {
                        if (!Bundle.isValidBundleName(alias)) {
                            return 'The bundle name format is invalid.  Only [a-z,0-9,-,_,.] allowed.  Value received: ' + alias;
                        }
                        else if (taskManager.availableBundleNames.has(alias)) {
                            return 'A bundle file with that name "' + alias + '" already exists.  Try a different file name.';
                        }
                        return true;
                    }
                },
                {
                    name: 'description',
                    type: 'input',
                    message: 'Describe your bundle (optional):'
                },
                //{
                //    name: 'useMinifyAndConcat',
                //    type: 'confirm',
                //    default: false,
                //    message: 'Would you like to concatenate or minify separate *.js, *.css, *.html, and/or template files from your bundle?'
                //},
                //{
                //    name: 'minifyAndConcat',
                //    type: 'checkbox',
                //    choices: ['js', 'css', 'html', 'mustache'],
                //    message: 'Choose file types you would like to concatenate from your bundle file:',
                //    when: function (answers) {
                //        return answers.useMinifyAndConcat;
                //    }
                //},
                {
                   name: 'otherTasks',
                   type: 'checkbox',
                   message: 'Choose any other tasks you would like to configure from your bundle file:',
                   choices: otherTaskKeys
                }
            ];

        this._registerTaskWithTaskRunner(taskManager, questions);
    }

    _registerTaskWithTaskRunner(taskManager, questions) {
        var self = this;

        taskManager.taskRunnerAdapter.task('bundle', function () {

            return new Promise(function (fulfill/*, reject*/) {

                taskManager.log(chalk.cyan('Running "bundle" task.\n\n'));

                inquirer.prompt(questions).then(function (answers) {
                    let {alias, description, configFormat, otherTasks} = answers,
                        {pwd, cwdBundlesPath} = taskManager;

                    var newConfig = { alias, description },
                        exampleConfig = gwUtils.loadConfigFile(path.join(pwd, self.config.emptyBundleFilePath)),
                        bundlePath = path.join(cwdBundlesPath, alias + configFormat);

                    // Ensure bundles path exists
                    gwUtils.ensurePathExists(cwdBundlesPath);

                    // Files hash
                    //if (answers.useMinifyAndConcat &&
                    //    answers.minifyAndConcat &&
                    //    answers.minifyAndConcat.length > 0) {
                    //    newConfig.files = {};
                    //    answers.minifyAndConcat.forEach(function (key) {
                    //        newConfig.files[key] = [];
                    //    });
                    //}

                    // Other tasks
                    if (otherTasks && otherTasks.length > 0) {
                       otherTasks.forEach(function (key) {
                           if (exampleConfig[key]) {
                               newConfig[key] = exampleConfig[key];
                           }
                       });
                    }

                    // console.log(taskManager.availableTaskNames.toJSON());
                    // console.log(otherTasks);
                    // console.log(newConfig);

                    // Write new config file
                    gwUtils.writeConfigFile(newConfig, bundlePath);

                    // Bundle config creation success messages
                    taskManager.log('\nSuccess!  Bundle config file written to: ', chalk.dim('"' + bundlePath + '"' ), '\n');
                    taskManager.log('Generated file output (format:' + configFormat + '):\n', '--verbose');
                    taskManager.log(chalk.dim(newConfig), '\n', '--verbose');

                    // Fullfill promise
                    fulfill();

                }); // end of inquiry

            }) // end of promise

            .catch(error => {
                taskManager.log(
                    chalk.red('\nFailure!'), '  ',
                    'Bundle config file could not be written to: ',
                    chalk.dim('"bundlePath"' ), '\n',
                    error
                );
            });

        }); // end of task

        return this;
    }

}

module.exports = BundleConfigTaskAdapter;
