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
    contextName = 'TaskManager';

class TaskManager extends TaskManagerConfig {

    taskAdapters (taskAdapters) {
        var retVal = this;
        if (taskAdapters) {
            this._taskAdapters = taskAdapters;
        }
        else {
            retVal = this._taskAdapters;
        }
        return retVal;
    }

    taskNames (taskNames) {
        var retVal = this;
        if (taskNames) {
            this._taskNames = taskNames;
        }
        else {
            retVal = this._taskNames;
        }
        return retVal;
    }

    staticTaskAdapters (staticTaskAdapters) {
        var retVal = this;
        if (staticTaskAdapters) {
            this._staticTaskAdapters = staticTaskAdapters;
        }
        else {
            retVal = this._staticTaskAdapters;
        }
        return retVal;
    }

    staticTaskNames (staticTaskNames) {
        var retVal = this;
        if (staticTaskNames) {
            this._staticTaskNames = staticTaskNames;
        }
        else {
            retVal = this._staticTaskNames;
        }
        return retVal;
    }

    taskRunnerAdapter (taskRunnerAdapter) {
        var retVal = this;
        if (taskRunnerAdapter) {
            this._taskRunnerAdapter = taskRunnerAdapter;
        }
        else {
            retVal = this._taskRunnerAdapter;
        }
        return retVal;
    }

    taskRunner (taskRunner) {
        var retVal = this;
        if (taskRunner) {
            this._taskRunner = taskRunner;
        }
        else {
            retVal = this._taskRunner;
        }
        return retVal;
    }

    configPath (configPath) {
        var retVal = this;
        if (configPath) {
            this._configPath = configPath;
        }
        else {
            retVal = this._configPath;
        }
        return retVal;
    }

    configBase (configBase) {
        var retVal = this;
        if (configBase) {
            this._configBase = configBase;
        }
        else {
            retVal = this._configBase;
        }
        return retVal;
    }

    argv (argv) {
        var retVal = this;
        if (argv) {
            this._argv = argv;
        }
        else {
            retVal = this._argv;
        }
        return retVal;
    }

    cwd (cwd) {
        var retVal = this;
        if (cwd) {
            this._cwd = cwd;
        }
        else {
            retVal = this._cwd;
        }
        return retVal;
    }

    pwd (pwd) {
        var retVal = this;
        if (pwd) {
            this._pwd = pwd;
        }
        else {
            retVal = this._pwd;
        }
        return retVal;
    }

    constructor(taskRunner, argv, env, config) {

        // Call super
        super();

        // Private variables that we expose to the outside start with `_`
        var self = this,
            _taskAdapters = new SjlMap(),
            _taskNames = new SjlSet(),
            _staticTaskAdapters = new SjlMap(),
            _staticTaskNames = new SjlSet(),
            _taskRunnerAdapter = {},
            _taskRunner = {},
            _configPath = '',
            _configBase = '',
            _argv = {},
            _cwd = '',
            _pwd = '';

        // Define properties
        Object.defineProperties(self, {
            _taskAdapters: {
                get: () => {
                    return _taskAdapters;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_taskAdapters', value, Object);
                    _taskAdapters = new SjlMap(value);
                }
            },
            _taskNames: {
                get: () => {
                    return _taskNames;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_taskNames', value, String);
                    _taskNames = new SjlSet(value);
                }
            },
            _staticTaskAdapters: {
                get: () => {
                    return _staticTaskAdapters;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_staticTaskAdapters', value, Object);
                    _staticTaskAdapters = new SjlMap(value);
                }
            },
            _staticTaskNames: {
                get: () => {
                    return _staticTaskNames;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_staticTaskNames', value, Array);
                    _staticTaskNames = new SjlSet(value);
                }
            },
            _taskRunner: {
                get: () => {
                    return _taskRunner;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_taskRunner', value, Object);
                    _taskRunner = value;
                }
            },
            _taskRunnerAdapter: {
                get: () => {
                    return _taskRunnerAdapter;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_taskRunnerAdapter', value, Object);
                    _taskRunnerAdapter = value;
                }
            },
            _configPath: {
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
            _configBase: {
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
            _argv: {
                get: () => {
                    return _argv;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_argv', value, Object);
                    _argv = value;
                }
            },
            _cwd: {
                get: () => {
                    return _cwd;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_cwd', value, String);
                    _cwd = value;
                }
            },
            _pwd: {
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
        self.cwd(env.configBase)
            .pwd(env.pwd)
            .argv(argv)
            .configPath(env.configPath)
            .options(config)
            .initRunSequence(self);
    }

    initRunSequence (self) {

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

    _createTaskAdapter(taskName) {
    }

    _createTaskAdapters(taskNames) {
    }

    _createStaticTaskAdapter(staticTaskName) {
    }

    _createStaticTaskAdapters(staticTaskNames) {
    }

    _createBundleConfig(bundleConfigObj) {
    }

    _createBundleConfigs(bundleConfigObjs, registerWithTaskAdapters) {
    }

    _setTaskAdapter(taskName, taskAdapter) {
    }

}

module.exports = TaskManager;
