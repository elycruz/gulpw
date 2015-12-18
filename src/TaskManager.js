/**
 * Created by elydelacruz on 10/4/15.
 * @todo Figure out if we need to create an `TaskManagerEnv` object to enforce that the inner used properties are set
 */

'use strict';

let TaskManagerConfig = require('TaskManagerConfig');

class TaskManager extends TaskManagerConfig {

    constructor(taskRunner, argv, env, config) {
        var _taskAdapters,
            _taskNames,
            _staticTaskAdapters,
            _staticTaskNames,
            _taskRunner,
            _env,
            _argv,
            _cwd,
            _pwd;

        Object.defineProperties(this, {
            _taskAdapters: null,
            _taskNames: null,
            _staticTaskAdapters: null,
            _staticTaskNames: null,
            _taskRunner: null,
            _env: env,
            _argv: argv,
            _cwd: {
                get: () => {
                    return _cwd;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        TaskManager.name, '_cwd', value, String,
                        'Only strings allowed for this property');
                    _cwd = value;
                }
            }, //env.configBase,
            _pwd: {
                get: () => {
                    return _pwd;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        TaskManager.name, '_pwd', value, String,
                        'Only strings allowed for this property');
                    _pwd = value;
                }
            } //env.pwd,
        });

        super(config);

        sjl.extend(true, this, {
            _cwd: env.configBase,
            _pwd: env.pwd,
            _configPath: env.configPath
        });

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
