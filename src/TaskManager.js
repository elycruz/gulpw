/**
 * Created by elydelacruz on 10/4/15.
 * @todo Figure out if we need to create an `TaskManagerEnv` object to enforce that the inner used properties are set
 */

'use strict';

let TaskAdapter = require('./TaskAdapter'),
    TaskManagerConfig = require('./TaskManagerConfig'),
    TaskRunnerAdapter = require('./TaskRunnerAdapter'),
    Bundle = require('./Bundle'),
    sjl = require('sjljs'),
    SjlSet = sjl.SjlSet,
    SjlMap = sjl.SjlMap,
    gwUtils = require('./Utils'),
    chalk = require('chalk'),
    path = require('path'),
    fs = require('fs'),
    contextName = 'TaskManager';

var log;

class TaskManager extends TaskManagerConfig {

    constructor(config) {

        // Call super
        super();

        // Private variables that we expose to the outside start with `_`
        var self = this,
            _argv               = {},
            _configBase         = '',
            _configPath         = '',
            _cwd                = '',
            _pwd                = '',
            _taskRunnerAdapter  = {};

        // Define properties
        Object.defineProperties(self, {
            argv: {
                get: () => {
                    return _argv;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_argv', value, Object);
                    _argv = value;
                }
            },
            availableBundleNames: {},
            availableTaskNames: {},
            availableStaticTaskNames: {},
            bundles: {
                value: new SjlMap()
            },
            bundleFileNames: {
                value: new SjlSet()
            },
            sessionBundleNames: {
                value: new SjlSet()
            },
            configBase: {
                get: () => {
                    return _configBase;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_configBase', value, String,
                        'Only strings are allowed for this property');
                    _configBase = value;
                }
            },
            commands: {
                value: new SjlSet()
            },
            configPath: {
                get: () => {
                    return _configPath;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_configPath', value, String,
                        'Only strings are allowed for this property');
                    _configPath = value;
                }
            },
            config: {
                value: config
            },
            errorReports: {
                value: new SjlMap()
            },
            warningReports: {
                value: new SjlMap()
            },
            durationReports: {
                value: new SjlMap()
            },
            taskAdapters: {
                value: new Map()
            },
            sessionTaskNames: {
                value: new SjlSet()
            },
            splitCommands: {
                value: new Map()
            },
            staticTaskAdapters: {
                value: new Map()
            },
            sessionStaticTaskNames: {
                value: new SjlSet()
            },
            taskRunnerAdapter: {
                get: () => {
                    return _taskRunnerAdapter;
                },
                set: (value) => {
                    var retVal = this;
                    if (value && value instanceof TaskRunnerAdapter) {
                        _taskRunnerAdapter = value;
                    }
                    else if (value && value instanceof TaskRunnerAdapter === false) {
                        throw new TypeError (contextName + '.taskRunnerAdapter only accepts types of `TaskRunnerAdapter` or ' +
                            'subclasses of `TaskRunnerAdapter`.  Type recieved: \'' + sjl.classOf(value) + '\'.');
                    }
                }
            },
            cwd: {
                get: () => {
                    return _cwd;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_cwd', value, String);
                    _cwd = value;
                }
            },
            pwd: {
                get: () => {
                    return _pwd;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_pwd', value, String);
                    _pwd = value;
                }
            }
        });

        // Set log function
        log = gwUtils.logger(this.argv, this);
        this.set(config);
    }

    /**
     * @todo add unknown bundle-name, task-name, and static-task-name warnings
     */
    init () {

        // If no CLI arguments supplied exit,
        if (sjl.empty(this.argv)) {
            log(chalk.yellow('! No arguments supplied.'));
            return this;
        }

        var splitCommandOn = ':',
            bundleFileNames = this.bundleFileNames
                .addFromArray(fs.readdirSync(this.config.bundlesPath)),
            availableTaskNames          = this.availableTaskNames.addFromArray(Object.keys(this.config.tasks)),
            availableStaticTaskNames    = this.availableStaticTaskNames(Object.keys(this.config.staticTasks)),
            availableBundleNames        = this.availableBundleNames.addFromArray(bundleFileNames.map((fileName) => {
                return fileName.split(/\.(?:json|js|yaml|yml)$/)[0];
            })),
            addedBundleNames            = this.sessionBundleNames,
            addedTaskNames              = this.sessionTaskNames,
            addedStaticTaskNames        = this.sessionStaticTaskNames;

        // Get split commands
        this.argv._.forEach((value) => {
            let splitCommand = this.taskRunnerAdapter.splitCommand(value, splitCommandOn),
                bundle = splitCommand.bundle,
                command = splitCommand.command,
                taskName = splitCommand.taskAlias,
                taskAdapter,
                staticTaskAdapter;

            // Task Names
            if (!sjl.isEmptyOrNotOfType(taskName, String) && availableTaskNames.has(taskName) && !addedTaskNames.has(taskName)) {
                addedTaskNames.add(taskName);
                taskAdapter = this._initTaskAdapter(taskName, this.config.tasks[taskName]);
            }
            else {
                throw new Error('An error occurred before registering task name "' + taskName + '".' +
                    '  Either the task name is empty, not of the correct type, or the task name was not found in ' +
                    '`available task names`.');
            }

            // Static Task Names
            if (sjl.classOfIs(command, String) && command.indexOf(splitCommandOn) === -1
                && !availableTaskNames.has(command)
                && availableStaticTaskNames.has(command)
                && !addedStaticTaskNames.has(command)) {
                addedStaticTaskNames.add(command);
                staticTaskAdapter =
                    this._initStaticTaskAdapter(taskName, this.config.staticTasks[taskName]);
            }
            else {
                throw new Error('An error occurred before registering staticTaskName name "' + taskName + '".' +
                    '  Either the staticTaskName name is empty, not of the correct type, or the staticTaskName was not found in ' +
                    '`available staticTaskNames`.');
            }

            // Bundle Names
            if (!sjl.isEmptyOrNotOfType(bundle, String)
                && availableBundleNames.indexOf(bundle) > -1
                && !addedBundleNames.has(bundle)) {
                addedBundleNames.add(bundle);
                let bundleObj = this._initBundle(bundle, gwUtils.loadConfigFileFromSupportedExts(
                    path.join(this.cwd, this.configs.bundlesPath, bundle)));

                // Register bundle with task adapter or static task adapter
                if (taskAdapter) {
                    taskAdapter.registerBundle(bundleObj);
                }
                else if (staticTaskAdapter) {
                    staticTaskAdapter.registerBundle(bundleObj);
                }
            }
            else {
                throw new Error('An error occurred before registering bundle name "' + bundle + '".' +
                    '  Either the bundle name is empty, not of the correct type, or the bundle was not found in ' +
                    '`available bundles`.');
            }

            // Split commands
            this.splitCommands.set(command, splitCommand);

        }, this);

        // Clear memory
        availableStaticTaskNames = null;
        availableTaskNames = null;
        availableBundleNames = null;
        addedBundleNames = null;
        addedStaticTaskNames = null;
        addedTaskNames = null;
        bundleFileNames = null;
        splitCommandOn = null;

        // Ensure globally called tasks adapters are invoked globally as well
        return this._ensureInvokedGlobalTasks();
    }

    getTaskAdapter(taskName) {
        var taskAdapter,
            hasTaskName = this.availableTaskNames.has(taskName),
            taskNameNotRegistered = this.sessionTaskNames.has(taskName);
        if (hasTaskName) {
            if (taskNameNotRegistered) {
                taskAdapter = this._initTaskAdapter(taskName, this.config.tasks[taskName]);
            }
            else {
                taskAdapter = this.taskAdapters.get(taskName);
            }
        }
        else {
            throw new Error ('`' + contextName + '.getTaskAdapter` doesn\'t have a task ' +
                'available for task name "' + taskName + '".  Available task names: \n - ' +
                sjl.implode(this.availableTaskNames, '\n - ') + '.');
        }
        return taskAdapter;
    }

    isTaskRegistered (task) {
        return this.taskRunnerAdapter.has(task);
    }

    launchTasks (taskCommands) {
        return this;
    }

    launchTasksSync (taskCommands) {
        return this;
    }

    log () {
        return log (...sjl.argsToArray(arguments));
    }

    _initTaskAdapter(taskName, taskConfig) {
        taskConfig.alias = taskName;
        var FetchedTaskAdapterClass = require(path.join(this.cwd, taskConfig.constructorLocation)),
            taskAdapter = new FetchedTaskAdapterClass(taskConfig, this);
        this.taskAdapters.set(taskName, taskAdapter);
        return taskAdapter;
    }

    _initBundle(bundleName, bundleConfig) {
        bundleConfig.alias = bundleName;
        var bundleObj = new Bundle(bundleConfig);
        this.bundles.set(bundleName, bundleObj);
        return bundleObj;
    }

    _initStaticTaskAdapter(staticTaskName, staticTaskConfig) {
        staticTaskConfig.alias = staticTaskName;
        var FetchedStaticTaskAdapterClass = require(path.join(this.cwd, staticTaskConfig.constructorLocation)),
            staticTaskAdapter = new FetchedStaticTaskAdapterClass(staticTaskConfig, this);
        this.staticTaskAdapters.set(staticTaskName, staticTaskAdapter);
        return staticTaskAdapter;
    }

    _ensureInvokedGlobalTasks () {
        // Ensure globally called tasks are called
        this.splitCommands.forEach(function (commandMeta) {
            if (commandMeta.bundle || !this.sessionTaskNames.has(commandMeta.taskAlias)) {
                return;
            }
            this.getTaskAdapter(commandMeta.taskAlias)
                .registerBundles(this.bundles, this);
        }, this);
        return this;
    }

}

module.exports = TaskManager;
