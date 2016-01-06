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
    contextName = 'TaskManager';

class TaskManager extends TaskManagerConfig {

    constructor(config) {

        // Call super
        super();

        // Private variables that we expose to the outside start with `_`
        var self = this,
            _taskAdapters = new SjlMap(),
            _taskNames = new SjlSet(),
            _staticTaskAdapters = new SjlMap(),
            _staticTaskNames = new SjlSet(),
            _bundleNames = new SjlSet(),
            _taskRunnerAdapter = {},
            _taskRunner = {},
            _configPath = '',
            _configBase = '',
            _argv = {},
            _cwd = '',
            _pwd = '';

        // Define properties
        Object.defineProperties(self, {
            config: {
                value: config
            },
            availableTaskNames: {
                value: new SjlSet(Object.keys(config.tasks))
            },
            availableStaticTaskNames: {
                value: new SjlSet(Object.keys(config.staticTasks))
            },
            availableBundleNames: {
                value: new SjlSet()
            },
            taskAdapters: {
                get: () => {
                    return _taskAdapters;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_taskAdapters', value, Object);
                    _taskAdapters = new SjlMap(value);
                }
            },
            taskNames: {
                get: () => {
                    return _taskNames;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_taskNames', value, String);
                    _taskNames = new SjlSet(value);
                }
            },
            staticTaskAdapters: {
                get: () => {
                    return _staticTaskAdapters;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_staticTaskAdapters', value, Object);
                    _staticTaskAdapters = new SjlMap(value);
                }
            },
            staticTaskNames: {
                get: () => {
                    return _staticTaskNames;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_staticTaskNames', value, Array);
                    _staticTaskNames = new SjlSet(value);
                }
            },
            bundleNames: {
                get: () => {
                    return _bundleNames;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_bundleNames', value, Array);
                    _bundleNames = new SjlSet(value);
                }
            },
            taskRunner: {
                get: () => {
                    return _taskRunner;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_taskRunner', value, Object);
                    _taskRunner = value;
                }
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
            argv: {
                get: () => {
                    return _argv;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_argv', value, Object);
                    _argv = value;
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
        self.set(config)
            .initEntityNames();
    }

    /**
     * @todo add unknown bundle-name, task-name, and static-task-name warnings
     */
    initEntityNames () {
        var splitCommandOn = ':';

        // @todo temporary escape here
        if (sjl.empty(this.argv)) {
            return this;
        }

        // Get split commands
        this.splitCommands = this.argv._.map((value) => {
            let retVal = this.taskRunnerAdapter.splitCommand(value, splitCommandOn),
                bundle = retVal.bundle,
                command = retVal.command,
                taskName = retVal.taskAlias;

            // Bundle Names
            if (!sjl.isEmptyOrNotOfType(bundle, String) && this.availableBundleNames.has(bundle)) {
                this.bundleNames.add(bundle);
            }
            else {
                throw new Error('An error occurred before registering bundle name "' + bundle + '".' +
                    '  Either the bundle name is empty, not of the correct type, or the bundle was not found in ' +
                    '`available bundles`.');
            }

            // Task Names
            if (!sjl.isEmptyOrNotOfType(taskAlias, String) && this.availableTaskNames.has(taskAlias)) {
                this.taskNames.add(taskAlias);
            }
            else {
                throw new Error('An error occurred before registering taskName name "' + taskName + '".' +
                    '  Either the taskName name is empty, not of the correct type, or the taskName was not found in ' +
                    '`available taskNames`.');
            }

            // Static Task Names
            if (sjl.classOfIs(command, String) && command.indexOf(splitCommandOn) === -1
                && !this.availableTaskNames.has(command)
                && this.availableStaticTaskNames.has(command)) {
                this.staticTaskNames.add(command);
            }
            else {
                throw new Error('An error occurred before registering staticTaskName name "' + staticTaskName + '".' +
                    '  Either the staticTaskName name is empty, not of the correct type, or the staticTaskName was not found in ' +
                    '`available staticTaskNames`.');
            }

            return retVal;
        }, this);
    }

    initEntities () {
        return this._initStaticTaskAdapters()
            ._initTaskAdapters()
            ._initBundleConfigs();
    }

    init () {
        this._initEntityNames()
            ._initEntities();
        console.log('Beginning `TaskManager` run sequence.');
        return this.taskRunnerAdapter.taskRunner;
    }

    getTaskAdapter(taskName) {
    }

    registerBundleConfigs(bundleConfigs) {
    }

    registerBundleConfigWithTask(bundleConfig, taskName) {
    }

    registerBundleConfigWithTasks(bundleConfig, taskNames) {
    }

    registerBundleConfigsWithTasks(bundleConfigs, taskNames) {
    }

    isTaskRegisteredWithTaskRunner(taskName) {
    }

    _initTaskNames (taskNames) {
        let argv = this.argv;
        return this;
    }

    _initStaticTaskNames (staticTaskNames) {
        if (!Array.isArray(staticTaskNames) || staticTaskNames.length === 0) {

        }
        return this;
    }

    _initBundleNames (bundleNames) {
        return this;
    }

    _initTaskAdapter(taskName) {
    }

    _initTaskAdapters(taskNames) {
        return this;
    }

    _initStaticTaskAdapter(staticTaskName) {
    }

    _initStaticTaskAdapters(staticTaskNames) {
        if (!staticTaskNames) {
            return this;
        }
        this.staticTaskNames.forEach((name) => {

        });
        return this;
    }

    _initBundleConfig(bundleConfigObj) {
    }

    _initBundleConfigs(bundleConfigObjs, registerWithTaskAdapters) {
        return this;
    }

    _setTaskAdapter(taskName, taskAdapter) {
    }

}

module.exports = TaskManager;
