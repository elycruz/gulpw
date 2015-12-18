/**
 * Created by elydelacruz on 10/4/15.
 */
(function () {

    'use strict';

    let Config = require('./Config');

    class TaskManagerConfig extends Config {
        constructor(...options) {
            var _bundleConfigsPath,
                _bundleConfigFormats,
                _localConfigPath,
                _localConfigBackupPath,
                _localHelpDocsPath,
                _helpDocsPath,
                _taskConfigs,
                _staticTaskConfigs,
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
                _taskConfigs: {
                    get: () => {
                        return _taskConfigs;
                    },
                    set: (value) => {
                        var classOfValue = sjl.classOf(value);
                        if (classOfValue === 'Object') {
                            _taskConfigs = new sjl.package.stdlib.SjlMap();
                            // @todo finish this
                        }
                        else if (classOfValue === 'SjlMap') {
                            _taskConfigs = value;
                        }
                        else {
                            throw new Error(TaskManagerConfig)
                        }
                    }
                },
                _staticTaskConfigs: null,
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
            super({
                bundleConfigsPath: '',
                bundleConfigFormats: [],
                localConfigPath: '',
                localConfigBackupPath: '',
                localHelpPath: '',
                helpPath: '',
                staticTasks: {},
                tasks: {}
            }, ...options)
        }
    }

    module.exports = TaskManagerConfig;

}());
