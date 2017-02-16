/**
 * Created by elydelacruz on 10/4/15.
 * @todo Figure out if we need to create an `TaskManagerEnv` object to enforce that the inner used properties are set
 * @todo add unknown bundle-name, task-name, and static-task-name warnings
 */

'use strict';

let TaskAdapter = require('./TaskAdapter'),
    TaskManagerConfig = require('./TaskManagerConfig'),
    TaskRunnerAdapter = require('./TaskRunnerAdapter'),
    Bundle = require('./Bundle'),
    sjl = require('sjljs'),
    fjl = require('fjl'),
    SjlSet = sjl.ns.stdlib.SjlSet,
    SjlMap = sjl.ns.stdlib.SjlMap,
    gwUtils = require('./Utils'),
    chalk = require('chalk'),
    path = require('path'),
    fs = require('fs');

class TaskManager extends TaskManagerConfig {

    constructor (config) {
        super();

        let self = this,
            contextName = this.constructor.name,
            errorIfNotString =  (propName, value, hint) => {
                sjl.throwTypeErrorIfNotOfType(contextName, propName, value, String, hint);
            };

        let _argv               = {},
            _configBase         = '',
            _configPath         = '',
            _cwd                = '',
            _pwd                = '',
            _cwdBundlesPath     = '',
            _taskRunnerAdapter  = null;

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
                value: config,
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

        if (!config) {
            return;
        }

        // Inject the passed in configuration
        this.set(config)
            ._initLogger()
            ._initRunningMode()
            ._initBundlesPath()
            ._initAvailableNames()
            // Log before setting config(s)
            .log (
                chalk.cyan(
                    '\n"' + TaskManager.name + '" initiated.' +
                    '\nWith `config`:\n'
                ),
                chalk.cyan('\nConsole params:\n'),
                this.argv,
                '--debug'
            );
    }

    init () {

        // If no CLI arguments supplied exit,
        if (fjl.isEmpty(this.argv)) {
            this.log(chalk.yellow('! No arguments supplied.'));
            return this;
        }

        log(chalk.grey('Passed in tasks:'), this.argv._, '--debug');

        const splitCommandOn = ':',
            availableTaskNames          = this.availableTaskNames,
            availableStaticTaskNames    = this.availableStaticTaskNames,
            sessionBundleNames            = this.sessionBundleNames,
            sessionTaskNames              = this.sessionTaskNames,
            sessionStaticTaskNames        = this.sessionStaticTaskNames;

        // Get split commands
        this.argv._.forEach(function (value)  {

            let splitCommand = this.taskRunnerAdapter.splitCommand(value, splitCommandOn),
                bundle = splitCommand.bundle,
                command = splitCommand.command,
                taskName = splitCommand.taskAlias,

                isPopulatedTaskName = fjl.notEmptyAndOfType(taskName, String),
                isStaticTask = availableStaticTaskNames.has(taskName),
                isTask = availableTaskNames.has(taskName);

            // Task Names
            if (isPopulatedTaskName && isTask && !sessionTaskNames.has(taskName)) {
                sessionTaskNames.add(taskName);
                this._initAndSetTaskAdapter(taskName, sjl.jsonClone(this.config.taskConfigs[taskName]));
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
                && !sessionStaticTaskNames.has(command)) {
                sessionStaticTaskNames.add(command);
                this._initAndSetStaticTaskAdapter(taskName, sjl.jsonClone(this.config.staticTaskConfigs[taskName]));
            }
            else {
                throw new Error('An error occurred before registering staticTaskName name "' + taskName + '".' +
                    '  Either the staticTaskName name is empty, not of the correct type, or the staticTaskName was not found in ' +
                    '`available staticTaskNames`.');
            }

            if (sjl.notEmptyAndOfType(bundle, String) && !sessionBundleNames.has(bundle)) {
                this._initAndSetBundle(bundle);
            }

            // Split commands
            this.splitCommands.set(command, splitCommand);

        }, this);

        // Ensure globally called tasks adapters are invoked globally as well
        this._ensureInvokedGlobalTasks();

        return this.launchTasks(this.argv._);
    }

    getTaskAdapter (taskName) {
        let hasTaskName = this.availableTaskNames.has(taskName),
            taskNameNotRegistered = this.sessionTaskNames.has(taskName),
            taskAdapter;
        if (hasTaskName) {
            if (taskNameNotRegistered) {
                taskAdapter = this._initAndSetTaskAdapter(taskName, this.config.taskConfigs[taskName]);
                return taskAdapter;
            }
            return this.taskAdapters.get(taskName);
        }
        throw new Error ('`' + this.construct.name + '.getTaskAdapter` doesn\'t have a task ' +
            'available for task name "' + taskName + '".  Available task names: \n - ' +
            sjl.implode(this.availableTaskNames, '\n - ') + '.');
    }

    getStaticTaskAdapter (taskName) {
        let taskAdapter,
            hasStaticTaskName = this.availableStaticTaskNames.has(taskName),
            taskNameNotRegistered = this.sessionStaticTaskNames.has(taskName);
        if (hasStaticTaskName) {
            if (taskNameNotRegistered) {
                taskAdapter = this._initAndSetStaticTaskAdapter(taskName, sjl.jsonClone(this.config.staticTaskConfigs[taskName]));
            }
            else {
                taskAdapter = this.taskAdapters.get(taskName);
            }
            return taskAdapter;
        }
        throw new Error ('`' + this.constructor.name + '.getStaticTaskAdapter` doesn\'t have a task ' +
            'available for task name "' + taskName + '".  Available task names: \n - ' +
            sjl.implode(this.availableStaticTaskNames, '\n - ') + '.');
    }

    getBundle (bundleName) {
        let hasBundleName = this.availableBundleNames.has(bundleName),
            bundleNameNotRegistered = this.sessionBundleNames.has(bundleName),
            bundle;
        if (hasBundleName) {
            if (bundleNameNotRegistered) {
                this._initAndSetBundle(bundleName, this.config.bundleConfigs[bundleName]);
            }
            else {
                this.bundles.get(bundleName);
            }
        }
        throw new Error ('`' + this.construct.name + '.getBundleAdapter` doesn\'t have a bundle ' +
            'available for bundle name "' + bundleName + '".  Available bundle names: \n - ' +
            sjl.implode(this.availableBundleNames, '\n - ') + '.');
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

    log (...args) {
        return this.logger (...args);
    }

    _initAvailableNames () {
        this.bundleFileNames.addFromArray(fs.readdirSync(this.bundlesPath));
        this.availableTaskNames.addFromArray(Object.keys(this.config.taskConfigs));
        this.availableStaticTaskNames.addFromArray(Object.keys(this.config.staticTaskConfigs));
        this.availableBundleNames.addFromArray(
            this.bundleFileNames._values.map(
                fileName => fileName.split(/\.(?:json|js|yaml|yml)$/)[0]
            )
        );
        return this;
    }

    _initBundlesPath () {
        this.cwdBundlesPath = this.bundlesPath = path.join(this.configBase, this.bundlesPath);
        return this;
    }

    _initRunningMode () {
        this.runningInMode = this.argv.async ?
            this.constructor.RUNNING_MODE_ASYNC :
                this.constructor.RUNNING_MODE_SYNC;
        return this;
    }

    _initLogger () {
        Object.defineProperty(this, 'logger', {
            value: gwUtils.logger(this.argv, this),
            enumerable: true
        });
        return this;
    }

    _initAndSetBundle(bundleName) {
        let isAvailableBundleName = this.availableBundleNames.has(bundleName),
            isBundleNameInSession = this.bundles.has(bundleName),
            bundle;

        // Check if we should register this `bundleName`
        if (isAvailableBundleName && !isBundleNameInSession) {

            // Create bundle obj
            let bundlePath = path.join(this.cwd, this.bundlesPath, bundleName),
                bundleConfig = gwUtils.loadConfigFileFromSupportedExts(bundlePath);
            bundleConfig.alias = bundleName;

            // Store bundle
            this.bundles.set(bundleName, new Bundle(bundleConfig));
        }
        else if (!isAvailableBundleName) {
            throw new Error('An error occurred before registering bundle name "' + bundleName + '".' +
                '  Either the bundle name is empty, not of the correct type, or the bundle was not found in ' +
                '`available bundles` path and object.');
        }
    }
    
    _initAndSetTaskAdapter(taskName, taskConfig) {
        taskConfig.alias = taskName;
        let FetchedTaskAdapterClass = require(path.join(this.cwd, taskConfig.constructorLocation)),
            taskAdapter = new FetchedTaskAdapterClass(taskConfig, this);
        this.taskAdapters.set(taskName, taskAdapter);
    }

    _initAndSetStaticTaskAdapter(staticTaskName, staticTaskConfig) {
        staticTaskConfig.alias = staticTaskName;
        let FetchedStaticTaskAdapterClass = require(path.join(this.pwd, staticTaskConfig.constructorLocation)),
            staticTaskAdapter = new FetchedStaticTaskAdapterClass(staticTaskConfig, this);
        this.staticTaskAdapters.set(staticTaskName, staticTaskAdapter);
    }

    _ensureInvokedGlobalTasks () {
        // Ensure globally called tasks are called
        this.splitCommands.forEach(commandMeta => {
            // this.log(commandMeta, this.sessionTaskNames.size);
            if (commandMeta.bundle || !this.sessionStaticTaskNames.has(commandMeta.taskAlias)) {
                return;
            }
            this.getStaticTaskAdapter(commandMeta.taskAlias).register(this);
        });
        return this;
    }

}

Object.defineProperties(TaskManager, {
    RUNNING_MODE_ASYNC: {value: 0},
    RUNNING_MODE_SYNC: {value: 1}
});

/**
 * @static RUNNING_MODE_ASYNC
 * @memberOf class:TaskManager
 * @type {Number}
 */

module.exports = TaskManager;
