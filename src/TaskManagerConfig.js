/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

let sjl = require('sjljs'),
    stdlib = sjl.ns.stdlib,
    SjlMap = stdlib.SjlMap,
    SjlSet = stdlib.SjlSet,
    Config = require('./Config'),
    contextName = 'TaskManagerConfig';

class TaskManagerConfig extends Config {

    constructor(...options) {

        super();

        var self = this,

        // Private props
            _bundleConfigsPath = '',
            _bundleConfigFormats = new SjlSet(),
            _localConfigPath = '',
            _localConfigBackupPath = '',
            _localHelpDocsPath = '',
            _helpDocsPath = '',
            _taskConfigs = new SjlMap(),
            _staticTaskConfigs = new SjlMap();

        // Define props
        Object.defineProperties(self, {
            _bundleConfigsPath: {
                get: () => {
                    return _bundleConfigsPath;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_bundlesConfigPath', value, String,
                        'Only strings allowed for self property');
                    _bundleConfigsPath = value;
                }
            },
            _bundleConfigFormats: {
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_bundleConfigFormats', value, Array);
                    _bundleConfigFormats.addFromArray(value);
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
                        contextName, '_localConfigPath', value, String,
                        'Only strings allowed for self property');
                    _localConfigPath = value;
                }
            },
            _localConfigBackupPath: {
                get: () => {
                    return _localConfigBackupPath;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_localConfigBackupPath', value, String,
                        'Only strings allowed for self property');
                    _localConfigBackupPath = value;
                }
            },
            _localHelpDocsPath: {
                get: () => {
                    return _localHelpDocsPath;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_localHelpDocsPath', value, String,
                        'Only strings allowed for self property');
                    _localHelpDocsPath = value;
                }
            },
            _helpDocsPath: {
                get: () => {
                    return _helpDocsPath;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_helpDocsPath', value, String,
                        'Only strings allowed for self property');
                    _helpDocsPath = value;
                }
            },
            _taskConfigs: {
                get: () => {
                    return _taskConfigs;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_taskConfigs', value, Object);
                    _taskConfigs = new SjlMap(value);
                }
            },
            _staticTaskConfigs: {
                get: () => {
                    return _staticTaskConfigs;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_staticTaskConfigs', value, Object);
                    _staticTaskConfigs = new SjlMap(value);
                }
            }
        });

        self.options(...options);
    }

    bundleConfigsPath(bundleConfigsPath) {
        var retVal = this;
        if (typeof bundleConfigsPath === 'undefined') {
            retVal = this._bundleConfigsPath;
        }
        else {
            this._bundleConfigsPath = bundleConfigsPath;
        }
        return retVal;
    }

    bundleConfigFormats(bundleConfigFormats) {
        var retVal = this;
        if (bundleConfigFormats) {
            this._bundleConfigFormats = bundleConfigFormats;
        }
        else {
            retVal = this._bundleConfigFormats;
        }
        return retVal;
    }

    localConfigPath(localConfigPath) {
        var retVal = this;
        if (localConfigPath) {
            this._localConfigPath = localConfigPath;
        }
        else {
            retVal = this._localConfigPath;
        }
        return retVal;
    }

    localConfigBackupPath(localConfigBackupPath) {
        var retVal = this;
        if (localConfigBackupPath) {
            this._localConfigBackupPath = localConfigBackupPath;
        }
        else {
            retVal = this._localConfigBackupPath;
        }
        return retVal;
    }

    localHelpDocsPath(localHelpDocsPath) {
        var retVal = this;
        if (localHelpDocsPath) {
            this._localHelpDocsPath = localHelpDocsPath;
        }
        else {
            retVal = this._localHelpDocsPath;
        }
        return retVal;
    }

    helpDocsPath(helpDocsPath) {
        var retVal = this;
        if (helpDocsPath) {
            this._helpDocsPath = helpDocsPath;
        }
        else {
            retVal = this._helpDocsPath;
        }
        return retVal;
    }

    taskConfigs(taskConfigs) {
        var retVal = this;
        if (taskConfigs) {
            this._taskConfigs = taskConfigs;
        }
        else {
            retVal = this._taskConfigs;
        }
        return retVal;
    }

    staticTaskConfigs(staticTaskConfigs) {
        var retVal = this;
        if (staticTaskConfigs) {
            this._staticTaskConfigs = staticTaskConfigs;
        }
        else {
            retVal = this._staticTaskConfigs;
        }
        return retVal;
    }

}

module.exports = TaskManagerConfig;
