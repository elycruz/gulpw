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
    SjlSet = sjl.ns.stdlib.SjlSet,
    SjlMap = sjl.ns.stdlib.SjlMap,
    gwUtils = require('./Utils'),
    chalk = require('chalk'),
    path = require('path'),
    fs = require('fs');

var log;

class TaskManager extends TaskManagerConfig {

    constructor(config) {
        super();
        let self = this,
            contextName = this.constructor.name,
            errorIfNotString =  (propName, value, hint) => {
                sjl.throwTypeErrorIfNotOfType(contextName, propName, value, String, hint);
            };

        var _defaultConfig      = gwUtils.loadConfigFile(path.join(__dirname, '/../configs/gulpw-config.yaml')), // @todo move this config path outward
            _argv               = {},
            _configBase         = '',
            _configPath         = '',
            _cwd                = '',
            _pwd                = '',
            _cwdBundlesPath     = '',
            _taskRunnerAdapter  = null,
            _joinedConfig = sjl.extend(true, _defaultConfig, config);

        Object.defineProperties(self, {
            argv: {
                get: function ()  {
                    return _argv;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(contextName, 'argv', value, Object);
                    if (!sjl.issetAndOfType(value._, 'Array')) {
                        throw new Error ('`' + contextName + '.argv` requires an object with a `_` property of type Array' +
                            '.  Type received: "' + sjl.classOf(value._)) + '".';
                    }
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
            sessionTaskNames: {
                value: new SjlSet(),
                enumerable: true
            },
            sessionStaticTaskNames: {
                value: new SjlSet(),
                enumerable: true
            },
            staticTaskAdapters: {
                value: new SjlMap(),
                enumerable: true
            },
            taskAdapters: {
                value: new SjlMap(),
                enumerable: true
            },
            cwd: {
                get: function ()  {
                    return _cwd;
                },
                set: function (value)  {
                    errorIfNotString('_cwd', value);
                    _cwd = value;
                },
                enumerable: true
            },
            cwdBundlesPath: {
                get: function () {
                    return _cwdBundlesPath;
                },
                set: function (value) {
                    errorIfNotString('cwdBundlesPath', value);
                    _cwdBundlesPath = value;
                },
                enumerable: true
            },
            configBase: {
                get: function ()  {
                    return _configBase;
                },
                set: function (value)  {
                    errorIfNotString('configBase', value, 'Only strings are allowed for this property');
                    if (value.length === 0) {
                        throw new Error ('`' + contextName + '.configBase` reqruires a string of length greater than `0`.');
                    }
                    _configBase = value;
                },
                enumerable: true
            },
            commands: {
                value: new SjlSet(),
                enumerable: true
            },
            splitCommands: {
                value: new SjlMap(),
                enumerable: true
            },
            configPath: {
                get: function ()  {
                    return _configPath;
                },
                set: function (value)  {
                    errorIfNotString('configPath', value, 'Only strings are allowed for this property');
                    if (value.length === 0) {
                        throw new Error ('`' + contextName + '.configPath` reqruires a string of length greater than `0`.');
                    }
                    _configPath = value;
                },
                enumerable: true
            },
            config: {
                value: _joinedConfig,
                enumerable: true
            },
            durationReports: {
                value: new SjlMap(),
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
            pwd: {
                get: function ()  {
                    return _pwd;
                },
                set: function (value)  {
                    errorIfNotString('_pwd', value);
                    _pwd = value;
                },
                enumerable: true
            },
            taskRunnerAdapter: {
                get: function ()  {
                    return _taskRunnerAdapter;
                },
                set: function (value)  {
                    if (value && value instanceof TaskRunnerAdapter) {
                        _taskRunnerAdapter = value;
                    }
                    else if (value && value instanceof TaskRunnerAdapter === false) {
                        throw new TypeError (contextName + '.taskRunnerAdapter only accepts types of `TaskRunnerAdapter` or ' +
                            'subclasses of `TaskRunnerAdapter`.  Type recieved: \'' + sjl.classOf(value) + '\'.');
                    }
                },
                enumerable: true
            }
        });

        // Inject the passed in configuration
        this.set(_joinedConfig);

        // Set bundles path
        this.cwdBundlesPath = this.bundlesPath = path.join(this.configBase, this.bundlesPath);

        // Populate some of our names
        this.bundleFileNames.addFromArray(fs.readdirSync(this.bundlesPath));
        this.availableTaskNames.addFromArray(Object.keys(this.config.tasks));
        this.availableStaticTaskNames.addFromArray(Object.keys(this.config.staticTasks));
        this.availableBundleNames.addFromArray(this.bundleFileNames._values.map(fileName => {
                return fileName.split(/\.(?:json|js|yaml|yml)$/)[0];
            }));

        // Set log function
        log = gwUtils.logger(this.argv, this);

        // Log before setting config(s)
        log (chalk.cyan('\n"' + TaskManager.name + '" initiated.\nWith `config`:\n'),
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

        log(chalk.grey('Passed in tasks:'), this.argv._, '--debug');

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

                isPopulatedTaskName = sjl.notEmptyAndOfType(taskName, String),
                isStaticTask = availableStaticTaskNames.has(taskName),
                isTask = availableTaskNames.has(taskName),

                taskAdapter,
                staticTaskAdapter;

            // Task Names
            if (isPopulatedTaskName && isTask && !addedTaskNames.has(taskName)) {
                addedTaskNames.add(taskName);
                taskAdapter = this._initTaskAdapter(taskName, sjl.jsonClone(this.config.tasks[taskName]));
            }
            else if (!isStaticTask) {
                throw new Error('An error occurred before registering task name "' + taskName + '".' +
                    '  Either the task name is empty, not of the correct type, or the task name was not found in ' +
                    '`available task names`.');
            }

            // Static Task Names
            if (isPopulatedTaskName && command.indexOf(splitCommandOn) === -1
                && isStaticTask
                && availableStaticTaskNames.has(command)
                && !addedStaticTaskNames.has(command)) {
                addedStaticTaskNames.add(command);
                staticTaskAdapter = this._initStaticTaskAdapter(taskName, sjl.jsonClone(this.config.staticTasks[taskName]));
            }
            else {
                throw new Error('An error occurred before registering staticTaskName name "' + taskName + '".' +
                    '  Either the staticTaskName name is empty, not of the correct type, or the staticTaskName was not found in ' +
                    '`available staticTaskNames`.');
            }

            if (sjl.notEmptyAndOfType(bundle, String)) {
                this._initBundle(bundle);
            }

            // Split commands
            this.splitCommands.set(command, splitCommand);

        }, this);

        // Ensure globally called tasks adapters are invoked globally as well
        this._ensureInvokedGlobalTasks();
        return this.launchTasks(this.argv._);
        // return this;
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
            throw new Error ('`' + this.construct.name + '.getTaskAdapter` doesn\'t have a task ' +
                'available for task name "' + taskName + '".  Available task names: \n - ' +
                sjl.implode(this.availableTaskNames, '\n - ') + '.');
        }
        return taskAdapter;
    }

    getStaticTaskAdapter (taskName) {
        var taskAdapter,
            hasStaticTaskName = this.availableStaticTaskNames.has(taskName),
            taskNameNotRegistered = this.sessionStaticTaskNames.has(taskName);
        if (hasStaticTaskName) {
            if (taskNameNotRegistered) {
                taskAdapter = this._initStaticTaskAdapter(taskName, sjl.jsonClone(this.config.staticTasks[taskName]));
            }
            else {
                taskAdapter = this.taskAdapters.get(taskName);
            }
        }
        else {
            throw new Error ('`' + this.constructor.name + '.getStaticTaskAdapter` doesn\'t have a task ' +
                'available for task name "' + taskName + '".  Available task names: \n - ' +
                sjl.implode(this.availableStaticTaskNames, '\n - ') + '.');
        }
        return taskAdapter;
    }

    isTaskRegistered (task) {
        return this.taskRunnerAdapter.hasTask(task);
    }

    launchTasks (taskCommands) {
        return this;
    }

    task (taskName, deps, callback) {
        return this;
    }

    launchTasksSync (taskCommands) {
        return this;
    }

    log (...args) {
        return log (...args);
    }

    _initTaskAdapter(taskName, taskConfig) {
        taskConfig.alias = taskName;
        var FetchedTaskAdapterClass = require(path.join(this.cwd, taskConfig.constructorLocation)),
            taskAdapter = new FetchedTaskAdapterClass(taskConfig, this);
        this.taskAdapters.set(taskName, taskAdapter);
        return taskAdapter;
    }

    _initBundle(bundleName) {
        let isAvailableBundleName = this.availableBundleNames.has(bundleName),
            isBundleNameInSession = this.bundles.has(bundleName);

        // Check if we should register this `bundleName`
        if (isAvailableBundleName && !isBundleNameInSession) {

            // Create bundle obj
            let bundlePath = path.join(this.cwd, this.bundlesPath, bundleName),
                bundleConfig = gwUtils.loadConfigFileFromSupportedExts(bundlePath),
                bundleObj = this._createBundle(bundleName, bundleConfig);

            // Store bundle
            this.bundles.set(bundleName, bundleObj);
        }
        else if (!isAvailableBundleName) {
            throw new Error('An error occurred before registering bundle name "' + bundleName + '".' +
                '  Either the bundle name is empty, not of the correct type, or the bundle was not found in ' +
                '`available bundles` path and object.');
        }
    }

    _initStaticTaskAdapter(staticTaskName, staticTaskConfig) {
        staticTaskConfig.alias = staticTaskName;
        var FetchedStaticTaskAdapterClass = require(path.join(this.pwd, staticTaskConfig.constructorLocation)),
            staticTaskAdapter = new FetchedStaticTaskAdapterClass(staticTaskConfig, this);
        this.staticTaskAdapters.set(staticTaskName, staticTaskAdapter);
        return staticTaskAdapter;
    }

    _createBundle (bundleName, bundleConfig) {
        bundleConfig.alias = bundleName;
        return new Bundle(bundleConfig);
    }

    _ensureInvokedGlobalTasks () {
        // Ensure globally called tasks are called
        this.splitCommands.forEach(function (commandMeta) {
            // log(commandMeta, this.sessionTaskNames.size);
            if (commandMeta.bundle || !this.sessionStaticTaskNames.has(commandMeta.taskAlias)) {
                return;
            }
            this.getStaticTaskAdapter(commandMeta.taskAlias).register(this);
        }, this);
        return this;
    }

}

module.exports = TaskManager;
