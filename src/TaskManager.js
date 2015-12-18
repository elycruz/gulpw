/**
 * Created by elydelacruz on 10/4/15.
 * @todo Figure out if we need to create an `TaskManagerEnv` object to enforce that the inner used properties are set
 */

'use strict';

class TaskManager {

    constructor(taskRunner, argv, env, config) {

        var _bundleConfigsPath,
            _bundleConfigFormats,
            _localConfigPath,
            _localConfigBackupPath,
            _localHelpDocsPath,
            _helpDocsPath,
            _taskConfigs,
            _taskAdapters,
            _taskNames,
            _staticTaskConfigs,
            _staticTaskNames,
            _taskRunner,
            _env,
            _argv,
            _cwd,
            _pwd,
            _configPath;

        Object.defineProperties(this, {
            _bundleConfigsPath: {
                get: () => {
                    return _bundleConfigsPath;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        TaskManager.name, '_bundlesConfigPath', value, String,
                        'Only strings allowed for this property');
                    _bundleConfigsPath = value;
                }
            },
            _bundleConfigFormats: {
                set: (value) => {
                    var classOfValue = sjl.classOf(value);
                    if (Array.isArray(value)) {
                    }
                },
                get: () => {
                    return _bundleConfigFormats;
                }
            },
            _localConfigPath: {
                get: () => {
                    return _localConfigPath;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        TaskManager.name, '_localConfigPath', value, String,
                        'Only strings allowed for this property');
                    _bundleConfigsPath = value;
                }
            },
            _localConfigBackupPath: {
                get: () => {
                    return _localConfigBackupPath;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        TaskManager.name, '_localConfigPath', value, String,
                        'Only strings allowed for this property');
                    _localConfigBackupPath = value;
                }
            },
            _localHelpDocsPath: {
                get: () => {
                    return _localHelpDocsPath;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        TaskManager.name, '_localHelpDocsPath', value, String,
                        'Only strings allowed for this property');
                    _localHelpDocsPath = value;
                }
            },
            _helpDocsPath: {
                get: () => {
                    return _helpDocsPath;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        TaskManager.name, '_helpDocsPath', value, String,
                        'Only strings allowed for this property');
                    _helpDocsPath = value;
                }
            },
            _taskConfigs: null,
            _taskAdapters: null,
            _taskNames: null,
            _staticTaskConfigs: null,
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
            }, //env.pwd,
            _configPath: {
                get: () => {
                    return _configPath;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        TaskManager.name, '_configPath', value, String,
                        'Only strings allowed for this property');
                    _configPath = value;
                }
            } //env.configPath

        });

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
