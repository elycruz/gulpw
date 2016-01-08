/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

let sjl = require('sjljs'),
    SjlMap = sjl.SjlMap,
    SjlSet = sjl.SjlSet,
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
            bundleConfigsPath: {
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
            bundleConfigFormats: {
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_bundleConfigFormats', value, Array);
                    _bundleConfigFormats.addFromArray(value);
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
                        contextName, '_localConfigPath', value, String,
                        'Only strings allowed for self property');
                    _localConfigPath = value;
                }
            },
            localConfigBackupPath: {
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
            localHelpDocsPath: {
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
            helpDocsPath: {
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
            taskConfigs: {
                get: () => {
                    return _taskConfigs;
                },
                set: (value) => {
                    var classOfValue = sjl.classOf(value);
                    if (classOfValue === 'Object') {
                        _taskConfigs = new SjlMap(value);
                    }
                    else if (classOfValue === 'SjlMap') {
                        _taskConfigs = value;
                    }
                    else {
                        throw new TypeError('`' + contextName  + '._taskConfigs` only takes types of `SjlMap` and/or ' +
                            'types of `Object`.  Type received: `' + classOfValue + '`.');
                    }
                }
            },
            staticTaskConfigs: {
                get: () => {
                    return _staticTaskConfigs;
                },
                set: (value) => {
                    var classOfValue = sjl.classOf(value);
                    if (classOfValue === 'Object') {
                        _staticTaskConfigs = new SjlMap(value);
                    }
                    else if (classOfValue === 'SjlMap') {
                        _staticTaskConfigs = value;
                    }
                    else {
                        throw new TypeError('`' + contextName  + '._staticTaskConfigs` only takes types of `SjlMap` and/or ' +
                            'types of `Object`.  Type received: `' + classOfValue + '`.');
                    }
                }
            }
        });

        this.set(...options);
    }
}

module.exports = TaskManagerConfig;
