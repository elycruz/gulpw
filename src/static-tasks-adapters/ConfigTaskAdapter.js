/**
 * Created by Ely on 1/15/2015.
 */

/**
 * Created by edelacruz on 11/19/2014.
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

module.exports = BaseStaticTaskAdapter.extend(function ConfigTaskAdapter (/*options*/) {
    BaseStaticTaskAdapter.apply(this, arguments);
}, {

    registerStaticTask: function (gulp, wrangler) {
        var self = this,
            unconfigurableTasks = wrangler.staticTasks.config.unconfigurableTasks,
            taskKeys = Object.keys(wrangler.tasks).filter(function (key) {
                return unconfigurableTasks.indexOf(key) === -1 ? true : false;
            }),
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
                    message: 'Please select the tasks you would like to configure from your newly generated wrangler config file:',
                    choices: taskKeys
                }
            ];

        gulp.task('config', function () {
            return (new Promise(function (fulfill/*, reject*/) {

                console.log(chalk.cyan('Running "config" task.\n\n') +
                chalk.dim('** Note ** - Any existing config will be backed up to "' + wrangler.localConfigBackupPath + '" before generating a new one. \n'));

                inquirer.prompt(questions, function (answers) {
                    var newConfig = wrangler.loadConfigFile(path.join(wrangler.pwd, '/configs/wrangler.config.yaml')),
                        newConfigPath,
                        oldConfig = fs.existsSync(wrangler.configPath) ? wrangler.loadConfigFile(wrangler.configPath) : null,
                        oldFileName = path.basename(wrangler.configPath),
                        oldFileExt = path.extname(oldFileName),
                        backupPath = path.join(process.cwd(), wrangler.localConfigBackupPath),
                        backupFilePath = path.join(backupPath, oldFileName),
                        tmpFileName,
                        tmpPathName,
                        jsonSpace = '     ',
                        date,
                        month;

                    // If old config is not empty back it up
                    if (!sjl.empty(oldConfig)) {

                        // Ensure backup file path exists
                        wrangler.ensurePathExists(backupPath);

                        // If backup file already exists create a timestamped version name
                        if (fs.existsSync(backupFilePath)) {
                            date = new Date();
                            month = date.getMonth() + 1;
                            month = month < 10 ? '0' + month : month;
                            date = [date.getFullYear(), month, date.getDate(), date.getHours(), date.getMinutes(), date.getMilliseconds()].join('-');
                            tmpFileName = path.basename(oldFileName, oldFileExt);
                            tmpFileName += '--' + date;
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
                    }

                    // Remove sections that were not specified to be kept by the user
                    self.cleanUpNewTasksList(taskKeys, answers.tasks, newConfig.tasks, self);

                    // If empty tasks object then remove it
                    if (sjl.empty(newConfig.tasks)) {
                        newConfig.tasks = null;
                        delete newConfig.tasks;
                    }

                    // Delete static tasks key
                    delete newConfig.staticTasks;

                    // Delete unconfigurable keys
                    unconfigurableTasks.forEach(function (key) {
                        delete newConfig.tasks[key];
                    });

                    // Delete other properties from config
                    newConfig.localHelpPath = newConfig.helpPath = null;
                    delete newConfig.localHelpPath;
                    delete newConfig.helpPath;

                    // Remove emptyBundle //@todo remove this one off deletion for a better alternative
                    //newConfig.staticTasks.bundle.emptyBundleFile = null;
                    //delete newConfig.staticTasks.bundle.emptyBundleFile;

                    // Get new config's contents
                    newConfig = answers.configFormat === '.json' ?
                        JSON.stringify(newConfig, null, jsonSpace) : yaml.safeDump(newConfig);

                    // Get new config path
                    tmpPathName = path.dirname(wrangler.configPath);
                    tmpFileName = wrangler.staticTasks.config.fileName; //path.basename(wrangler.configPath, answers.configFormat);
                    newConfigPath = path.join(tmpPathName, tmpFileName + answers.configFormat);

                    // Write new config file
                    fs.writeFileSync(newConfigPath, newConfig);

                    // 'New config written successfully' message
                    console.log(chalk.dim('\nNew config file written to "' + newConfigPath + '".'));

                    // Fullfill promise
                    fulfill();

                }); // end of inquiry

            })); // end of promise

        }); // end of task

    }, // end of register 'config' task

    removeUnWantedKeysFromTaskOptions: function (taskOptions, self) {
        Object.keys(taskOptions).forEach(function (taskItemInnerKey) {
            if (self.options.notAllowedInnerKeys.indexOf(taskItemInnerKey) > -1) {
                taskOptions[taskItemInnerKey] = null;
                delete taskOptions[taskItemInnerKey];
            }
        });
        return self;
    },

    cleanUpNewTasksList: function (taskKeys, taskKeysToKeep, tasksList, self) {
        taskKeys.forEach(function (key) {
            // Remove tasks not listed in answers.tasks
            if (taskKeysToKeep.indexOf(key) === -1) {
                tasksList[key] = null;
                delete tasksList[key];
            }
            else {
                self.removeUnWantedKeysFromTaskOptions(tasksList[key], self);
            }
        });
        return self;
    }

});
