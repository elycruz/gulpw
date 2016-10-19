/**
 * Created by Ely on 1/15/2015.
 */

/**
 * Created by edelacruz on 11/19/2014.
 */

'use strict';

let sjl = require('sjljs'),
    StaticTaskAdapter = require('./../../StaticTaskAdapter'),
    fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    inquirer = require('inquirer'),
    gwUtils = require('../../Utils'),
    chalk = require('chalk');

class GulpwConfigTaskAdapter extends StaticTaskAdapter {

    register (taskManager) {
        var self = this,
            config = self.config,
            unconfigurableTasks = self.config.unconfigurableTasks,
            taskKeys = Object.keys(taskManager.tasks).filter(function (key) {
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
                    message: 'Please select the tasks you would like to configure from your newly generated taskManager config file:',
                    choices: taskKeys
                }
            ];

        taskManager.taskRunnerAdapter.task('config', function () {
            return new Promise(function (fulfill, reject) {

                console.log(chalk.cyan('Running "config" task.\n\n') +
                chalk.dim('** Note ** - Any existing config will be backed up to "' + taskManager.localConfigBackupPath + '" before generating a new one. \n'));

                inquirer.prompt(questions).then(answers => {
                    var newConfig = gwUtils.loadConfigFile(path.join(taskManager.pwd, 'configs', config.defaultConfigFilename + '.yaml')),
                        newConfigPath,
                        oldConfig = fs.existsSync(taskManager.configPath) ? gwUtils.loadConfigFile(taskManager.configPath) : null,
                        oldFileName = path.basename(taskManager.configPath),
                        oldFileExt = path.extname(oldFileName),
                        backupPath = path.join(process.cwd(), taskManager.localConfigBackupPath),
                        backupFilePath = path.join(backupPath, oldFileName),
                        tmpFileName,
                        tmpPathName,
                        jsonSpace = '     ',
                        date,
                        month;

                    // If old config is not empty back it up
                    if (!sjl.empty(oldConfig)) {

                        // Message
                        taskManager.log('Backing up old config...');

                        // Ensure backup file path exists
                        gwUtils.ensurePathExists(backupPath);

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
                    tmpPathName = path.dirname(taskManager.configPath);
                    tmpFileName = taskManager.staticTasks.config.defaultConfigFilename; //path.basename(taskManager.configPath, answers.configFormat);
                    newConfigPath = path.join(tmpPathName, tmpFileName + answers.configFormat);

                    // Write new config file
                    fs.writeFileSync(newConfigPath, newConfig);

                    // 'New config written successfully' message
                    console.log(chalk.dim('\nNew config file written to "' + newConfigPath + '".'));

                    // Fullfill promise
                    fulfill();

                })
                .catch(error => {

                    reject(error);

                }); // end of inquiry

            }); // end of promise

        }); // end of task

    } // end of register 'config' task

    removeUnWantedKeysFromTaskOptions (taskOptions, self) {
        Object.keys(taskOptions).forEach(function (taskItemInnerKey) {
            if (self.config.notAllowedInnerKeys.indexOf(taskItemInnerKey) > -1) {
                taskOptions[taskItemInnerKey] = null;
                delete taskOptions[taskItemInnerKey];
            }
        });
        return self;
    }

    cleanUpNewTasksList (taskKeys, taskKeysToKeep, tasksList, self) {
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

}

module.exports = GulpwConfigTaskAdapter;

