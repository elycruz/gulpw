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
    chalk = require('chalk'),

    backupOldConfig = taskManager => {
        let oldConfig = gwUtils.isPathAccessibleSync(taskManager.configPath) ?
                gwUtils.loadConfigFile(taskManager.configPath) : null,
            oldFileName = path.basename(taskManager.configPath),
            oldFileExt = path.extname(oldFileName),
            backupPath = path.join(process.cwd(), taskManager.localConfigBackupPath),
            backupFilePath = path.join(backupPath, oldFileName);

        // If no old config exit function
        if (sjl.empty(oldConfig)) {
            return;
        }

        // Message
        taskManager.log('Backing up old config...');

        // Ensure backup file path exists
        gwUtils.ensurePathExists(backupPath);

        // If backup file already exists create a timestamped version name
        if (gwUtils.isPathAccessibleSync(backupFilePath)) {
            backupFilePath = path.join(backupPath,
                path.basename(oldFileName, oldFileExt) + '--' +
                gwUtils.dateToDashSeparatedTimestamp() + oldFileExt);
        }

        // Backup current config file
        gwUtils.writeConfigFile(backupFilePath, oldConfig);

        // 'Backup complete' message
        console.log(chalk.dim('\nOld config backed up successfully to "' + backupFilePath + '".\n'));
    };

class GulpwConfigTaskAdapter extends StaticTaskAdapter {

    constructor (config) {
        super(config);
    }

    register (taskManager) {
        let self = this,
            config = self.config,
            configFormats = sjl.setToArray(taskManager.configFormats).map(element => element[0]),
            unconfigurableTasks = new Set(self.config.unconfigurableTasks),
            taskKeys = sjl.setToArray(taskManager.availableTaskNames).map(element => element[0])
                .filter(key => !unconfigurableTasks.has(key)),
            staticTaskKeys = sjl.setToArray(taskManager.availableStaticTaskNames).map(element => element[0])
                .filter(key => !unconfigurableTasks.has(key)),
            otherConfigKeys = config.otherConfigKeys,
            questions = [
                {
                    name: 'configFormat',
                    type: 'list',
                    message: 'In what format would you like your config outputted?',
                    choices: configFormats
                },
                {
                    name: 'tasks',
                    type: 'checkbox',
                    message: 'Select tasks you would like to configure from your config:',
                    choices: taskKeys
                },
                {
                    name: 'staticTasks',
                    type: 'checkbox',
                    message: 'Select static tasks you would like to configure from your config:',
                    choices: staticTaskKeys
                },
                {
                    name: 'otherConfigKeys',
                    type: 'checkbox',
                    message: 'Select any other keys to include in config:',
                    choices: otherConfigKeys
                }
            ];

        // Define task
        taskManager.task(config.alternateTaskName, () => {

            // Notify of running task
            console.log(chalk.cyan('Running "config" task.\n\n') +
                chalk.dim('** Note ** - Any existing config will be backed up to "' +
                    taskManager.localConfigBackupPath +
                    '" before generating a new one. \n'));

            // Run config inquiry for config options
            return new Promise((resolve, reject) => {

                inquirer.prompt(questions).then(answers => {

                    let {defaultConfigFilePath, defaultConfigBasename} = config,
                        baseConfig = gwUtils.loadConfigFile(path.join(taskManager.pwd, defaultConfigFilePath)),
                        jsonSpace = taskManager.config.jsonIndentation,
                        {staticTasks: chosenStaticTaskKeys,
                            otherConfigKeys: chosenOtherConfigKeys,
                            tasks: chosenTaskKeys,
                            configFormat} = answers,
                        selectedTaskKeys = gwUtils.arrayDiff(chosenTaskKeys, unconfigurableTasks),
                        selectedStaticTaskKeys = gwUtils.arrayDiff(chosenStaticTaskKeys, unconfigurableTasks),
                        newConfig,
                        newFilePath;

                    // Backup old config if any
                    // backupOldConfig(taskManager);

                    // New Config
                    newConfig = chosenOtherConfigKeys.reduce((agg, key) => {
                        agg[key] = baseConfig[key];
                        return agg;
                    },{
                        tasks: selectedTaskKeys,
                        staticTasks: selectedStaticTaskKeys
                    });

                    // Get new config path
                    newFilePath = path.join(path.dirname(taskManager.configPath), defaultConfigBasename + configFormat);

                    // Write new config file
                    gwUtils.writeConfigFile(newFilePath, newConfig, jsonSpace);

                    // 'New config written successfully' message
                    console.log(chalk.dim('\nNew config file written to "' + newFilePath + '".'));

                    resolve();
                })
                    .catch(reject);
            })
                .catch(taskManager.log);
        });

        // Define alias for task
        taskManager.task('gulpw-config', [config.alternateTaskName]);
    }

}

module.exports = GulpwConfigTaskAdapter;
