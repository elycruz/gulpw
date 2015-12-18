/**
 * Created by elydelacruz on 10/4/15.
 * @todo Figure out if we need to create an `TaskManagerEnv` object to enforce that the inner used properties are set
 */

'use strict';

let TaskManagerConfig = require('TaskManagerConfig');

class TaskManager extends TaskManagerConfig {

    constructor(taskRunner, argv, config) {
        super();
        var _taskAdapters,
            _taskNames,
            _staticTaskAdapters,
            _staticTaskNames,
            _taskRunner,
            _contextRootPath,
            _argv,
            _cwd,
            _pwd;

        Object.defineProperties(this, {
            taskAdapters: null,
            taskNames: null,
            staticTaskAdapters: null,
            staticTaskNames: null,
            taskRunner: {
                value: taskRunner
            },
            argv: {
                value: argv
            },
            cwd: {
                value: env.configBase
            },
            pwd: {
                value: env.pwd
            },
            configPath: {
                value: env.configPath
            }
        });

        _cwd = env.configBase;
        _pwd = env.pwd;
        this._configPath = env.configPath;

        this.options(config);
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
