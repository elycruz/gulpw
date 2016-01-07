/**
 * Created by elydelacruz on 10/4/15.
 * @todo Figure out if we need to create an `TaskManagerEnv` object to enforce that the inner used properties are set
 */

'use strict';

let TaskManagerConfig = require('./TaskManagerConfig'),
    TaskRunnerAdapter = require('./TaskRunnerAdapter'),
    sjl = require('sjljs'),
    SjlSet = sjl.ns.stdlib.SjlSet,
    SjlMap = sjl.ns.stdlib.SjlMap,
    gwUtils = require('./Utils'),
    path = require('path'),
    fs = require('fs'),
    contextName = 'TaskManager';

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
            bundleConfigs: {
                value: new SjlMap()
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
                value: new Set()
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
            taskAdapters: {
                value: new Map()
            },
            taskConfigs: {
                value: new SjlMap()
            },
            splitCommands: {
                value: new Map()
            },
            staticTaskAdapters: {
                value: new Map()
            },
            staticTaskConfigs: {
                value: new SjlMap()
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

        // Set some more params and initiate run sequence
        sjl.extend(true, this, config);
        this.cwd = path.join(this.cwd, this.configBase);
        this.init();
    }

    /**
     * @todo add unknown bundle-name, task-name, and static-task-name warnings
     */
    init () {
        let splitCommandOn = ':';
        var availableTaskNames = new SjlSet(Object.keys(this.config.tasks)),
            availableStaticTaskNames = new SjlSet(Object.keys(this.config.staticTasks)),
            availableBundleNames = fs.readdirSync(this.bundlesPath);

        // @todo temporary escape here
        if (sjl.empty(this.argv)) {
            return this;
        }

        // Get split commands
        this.argv._.forEach((value) => {
            let splitCommand = this.taskRunnerAdapter.splitCommand(value, splitCommandOn),
                bundle = splitCommand.bundle,
                command = splitCommand.command,
                taskName = splitCommand.taskAlias;

            // Bundle Names
            if (!sjl.isEmptyOrNotOfType(bundle, String) && this.bundleConfigs.has(bundle)) {
                this._initBundle(bundle, gwUtils.loadConfigFileFromSupportedExts(path.join(this.cwd, this.bundlesPath, bundle)));
            }
            else {
                throw new Error('An error occurred before registering bundle name "' + bundle + '".' +
                    '  Either the bundle name is empty, not of the correct type, or the bundle was not found in ' +
                    '`available bundles`.');
            }

            // Task Names
            if (!sjl.isEmptyOrNotOfType(taskName, String) && availableTaskNames.has(taskName)) {
                this._initTaskAdapter(taskName, this.config.tasks[taskName]);
            }
            else {
                throw new Error('An error occurred before registering taskName name "' + taskName + '".' +
                    '  Either the taskName name is empty, not of the correct type, or the taskName was not found in ' +
                    '`available taskNames`.');
            }

            // Static Task Names
            if (sjl.classOfIs(command, String) && command.indexOf(splitCommandOn) === -1
                && !availableTaskNames.has(command)
                && availableStaticTaskNames.has(command)) {
                this._initStaticTaskAdapter(taskName, this.config.staticTasks[taskName]);
            }
            else {
                throw new Error('An error occurred before registering staticTaskName name "' + staticTaskName + '".' +
                    '  Either the staticTaskName name is empty, not of the correct type, or the staticTaskName was not found in ' +
                    '`available staticTaskNames`.');
            }

            // Split commands
            this.splitCommands.set(command, splitCommand);

        }, this);

        // Clear memory
        availableStaticTaskNames = null;
        availableTaskNames = null;

        //console.log('Beginning `TaskManager` run sequence.');
        return this.taskRunnerAdapter.taskRunner;
    }

    getTaskAdapter(taskName) {
    }

    registerBundles(bundleConfigs) {
    }

    registerBundleWithTask(bundleConfig, taskName) {
    }

    registerBundleWithTasks(bundleConfig, taskNames) {
    }

    registerBundlesWithTasks(bundleConfigs, taskNames) {
    }

    isTaskRegisteredWithTaskRunner(taskName) {
    }

    _initTaskAdapter(taskName, taskConfig) {
        var taskAdapter = null;
        this.taskAdapters.set(taskName, taskAdapter);
        return this;
    }

    _initBundle(bundleName, bundleConfig) {
        var bundleObj = null;
        this.bundleConfigs.set(bundleName, bundleObj);
        return this;
    }

    _initStaticTaskAdapter(staticTaskName, staticTaskConfig) {
        var staticTaskAdapter = null;
        this.staticTaskAdapters.set(staticTaskName, staticTaskAdapter);
        return this;
    }

}

module.exports = TaskManager;
