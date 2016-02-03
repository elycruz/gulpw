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
            _defaultConfig      = gwUtils.loadConfigFile(path.join(__dirname, '/../configs/gulpw-config.yaml')),
            _argv               = {},
            _configBase         = '',
            _configPath         = '',
            _cwd                = '',
            _pwd                = '',
            _taskRunnerAdapter  = {};

        // Define properties
        Object.defineProperties(self, {
            argv: {
                get: function ()  {
                    return _argv;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(contextName, 'argv', value, Object);
                    _argv = value;
                },
                enumerable: true
            },
            availableBundleNames: {
                value: new SjlSet(),
                enumerable: true
            },
            availableTaskNames: {
                value: new SjlSet(),
                enumerable: true
            },
            availableStaticTaskNames: {
                value: new SjlSet(),
                enumerable: true
            },
            bundles: {
                value: new SjlMap(),
                enumerable: true
            },
            bundleFileNames: {
                value: new SjlSet(),
                enumerable: true
            },
            sessionBundleNames: {
                value: new SjlSet(),
                enumerable: true
            },
            configBase: {
                get: function ()  {
                    return _configBase;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_configBase', value, String,
                        'Only strings are allowed for this property');
                    _configBase = value;
                },
                enumerable: true
            },
            commands: {
                value: new SjlSet(),
                enumerable: true
            },
            configPath: {
                get: function ()  {
                    return _configPath;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_configPath', value, String,
                        'Only strings are allowed for this property');
                    _configPath = value;
                },
                enumerable: true
            },
            config: {
                value: config,
                enumerable: true
            },
            errorReports: {
                value: new SjlMap(),
                enumerable: true
            },
            warningReports: {
                value: new SjlMap(),
                enumerable: true
            },
            durationReports: {
                value: new SjlMap(),
                enumerable: true
            },
            taskAdapters: {
                value: new SjlMap(),
                enumerable: true
            },
            sessionTaskNames: {
                value: new SjlSet(),
                enumerable: true
            },
            splitCommands: {
                value: new SjlMap(),
                enumerable: true
            },
            staticTaskAdapters: {
                value: new SjlMap(),
                enumerable: true
            },
            sessionStaticTaskNames: {
                value: new SjlSet(),
                enumerable: true
            },
            taskRunnerAdapter: {
                get: function ()  {
                    return _taskRunnerAdapter;
                },
                set: function (value)  {
                    var retVal = this;
                    if (value && value instanceof TaskRunnerAdapter) {
                        _taskRunnerAdapter = value;
                    }
                    else if (value && value instanceof TaskRunnerAdapter === false) {
                        throw new TypeError (contextName + '.taskRunnerAdapter only accepts types of `TaskRunnerAdapter` or ' +
                            'subclasses of `TaskRunnerAdapter`.  Type recieved: \'' + sjl.classOf(value) + '\'.');
                    }
                },
                enumerable: true
            },
            cwd: {
                get: function ()  {
                    return _cwd;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_cwd', value, String);
                    _cwd = value;
                },
                enumerable: true
            },
            pwd: {
                get: function ()  {
                    return _pwd;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_pwd', value, String);
                    _pwd = value;
                },
                enumerable: true
            }
        });

        // Inject the passed in configuration
        this.set(config);

        // Set bundles path
        this.bundlesPath = path.join(this.configBase, this.bundlesPath);

        // Populate some of our names
        this.bundleFileNames.addFromArray(fs.readdirSync(this.bundlesPath)),
        this.availableTaskNames.addFromArray(Object.keys(this.config.tasks)),
        this.availableStaticTaskNames.addFromArray(Object.keys(this.config.staticTasks)),
        this.availableBundleNames.addFromArray(this.bundleFileNames._values.map((fileName) => {
                return fileName.split(/\.(?:json|js|yaml|yml)$/)[0];
            })),

        // Set log function
        log = gwUtils.logger(config.argv, this);

        // Log before setting config(s)
        log (chalk.cyan('\n"' + TaskManager.name + '" initiated.\nWith `config`:\n'), config,
            chalk.cyan('\nConsole params:\n'), this.argv, '--debug');
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
            bundleFileNames             = this.bundleFileNames,
            availableTaskNames          = this.availableTaskNames,
            availableStaticTaskNames    = this.availableStaticTaskNames,
            availableBundleNames        = this.availableBundleNames,
            addedBundleNames            = this.sessionBundleNames,
            addedTaskNames              = this.sessionTaskNames,
            addedStaticTaskNames        = this.sessionStaticTaskNames;

        // Get split commands
        this.argv._.forEach(function (value)  {
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
        return log (...arguments);
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
