/**
 * Created by elydelacruz on 2/3/16.
 */
/**
 * Created by Ely on 1/15/2015.
 */
/**
 * Created by Ely on 1/15/2015.
 */

'use strict';


// Import base task proxy to extend
let sjl = require('sjljs'),
    fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    inquirer = require('inquirer'),
    chalk = require('chalk'),
    StaticTaskAdapter = require('./../../StaticTaskAdapter');

class BundleConfigTaskAdapter extends StaticTaskAdapter {

    constructor(config) {
        super();

        var _emptyBundleFilePath = '',
            _allowedTaskNames = [];

        // Augment config
        Object.defineProperties(this.config, {
            emptyBundleFilePath: {},
            allowedTaskName: {}
        });

        // Set config
        this.config = config;
    }

    register (taskManager) {
        var self = this,
            taskManager = self.taskManager,
            config = self.config,
            otherTaskKeys = config.allowedTasks,
            defaultBundleName = process.argv.length === 4 ? process.argv[3] : 'bundle',
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
                    default: defaultBundleName,
                    validate: function (alias) {
                        if (!/^[a-z]+[a-z\-\d_]+$/i.test(alias)) {
                            return 'The bundle name format is invalid.  Only [a-z,0-9,-,_,.] allowed.  Value received: ' + alias;
                        }
                        else if (fs.existsSync(path.join(taskManager.bundlesPath, alias + '.json'))
                            || fs.existsSync(path.join(taskManager.bundlesPath, alias + '.yaml'))) {
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
                //{
                //    name: 'otherTasks',
                //    type: 'checkbox',
                //    message: 'Choose any other tasks you would like to configure from your bundle file:',
                //    choices: otherTaskKeys
                //}
            ];
        this._registerWithTaskRunner(self, taskManager, questions);
    }

    _registerTaskWithTaskRunner(self, taskManager, questions) {

        self.taskRunner.task('bundle', function () {

            return new Promise(function (fulfill, reject) {

                console.log(chalk.cyan('Running "bundle" task.\n\n'));

                inquirer.prompt(questions, function (answers) {

                    var newConfig = {
                            alias: answers.alias,
                            version: '0.0.0',
                            description: ''
                        },
                        //exampleConfig = taskManager.loadConfigFile(path.join(taskManager.pwd, self.config.emptyBundleFilePath)),
                        jsonSpace = '     ',
                        bundlePath = path.join(taskManager.bundlesPath, answers.alias + answers.configFormat);

                    // Set description
                    newConfig.description = answers.description;

                    // Ensure bundles path exists
                    taskManager.ensurePathExists(taskManager.bundlesPath);

                    // Files hash
                    //if (answers.useMinifyAndConcat &&
                    //    answers.minifyAndConcat &&
                    //    answers.minifyAndConcat.length > 0) {
                    //    newConfig.files = {};
                    //    answers.minifyAndConcat.forEach(function (key) {
                    //        newConfig.files[key] = [];
                    //    });
                    //}
                    //
                    //// Other tasks
                    //if (answers.otherTasks && answers.otherTasks.length > 0) {
                    //    answers.otherTasks.forEach(function (key) {
                    //        newConfig[key] = exampleConfig[key];
                    //    });
                    //}

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

            }); // end of promise

        }); // end of task

        return this;
    }

}


module.exports = BundleConfigTaskAdapter;

