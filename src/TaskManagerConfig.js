/**
 * Created by elydelacruz on 10/4/15.
 */
(function () {

    'use strict';

    let sjl = require('sjljs'),
        stdlib = sjl.ns.stdlib,
        SjlMap = stdlib.SjlMap,
        SjlSet = stdlib.SjlSet,
        Config = require('./Config');

    class TaskManagerConfig extends Config {

        constructor (...options) {

            super();

            var _bundleConfigsPath = '',
                _bundleConfigFormats = new SjlSet(),
                _localConfigPath = '',
                _localConfigBackupPath = '',
                _localHelpDocsPath = '',
                _helpDocsPath = '',
                _taskConfigs = new SjlMap(),
                _staticTaskConfigs = new SjlMap(),
                _configPath = '';

            Object.defineProperties(this, {
                bundleConfigsPath: {
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
                bundleConfigFormats: {
                    set: (value) => {
                        var classOfValue = sjl.classOf(value);
                        if (Array.isArray(value)) {
                        }
                    },
                    get: () => {
                        return _bundleConfigFormats;
                    }
                },
                localConfigPath: {
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
                localConfigBackupPath: {
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
                localHelpDocsPath: {
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
                helpDocsPath: {
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
                taskConfigs: {
                    get: () => {
                        return _taskConfigs;
                    },
                    set: (value) => {
                        var classOfValue = sjl.classOf(value);
                        if (classOfValue === 'Object') {
                            _taskConfigs = new SjlMap(value);
                        }
                        else {
                            throw new Error(TaskManagerConfig)
                        }
                    }
                },
                staticTaskConfigs: {
                    get: () => {
                        return _taskConfigs;
                    },
                    set: (value) => {
                        var classOfValue = sjl.classOf(value);
                        if (classOfValue === 'Object') {
                            _staticTaskConfigs = new SjlMap(value);
                        }
                        else {
                            throw new Error(TaskManagerConfig)
                        }
                    }
                },
                configPath: {
                    get: () => {
                        return _configPath;
                    },
                    set: (value) => {
                        sjl.throwTypeErrorIfNotOfType(
                            TaskManager.name, '_configPath', value, String,
                            'Only strings are allowed for this property');
                        _configPath = value;
                    }
                }
            });

            this.options(...options);
        }
    }

    module.exports = TaskManagerConfig;

}());
