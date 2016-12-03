/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

let sjl = require('sjljs'),
    SjlMap = sjl.ns.stdlib.SjlMap,
    SjlSet = sjl.ns.stdlib.SjlSet,
    Config = sjl.ns.stdlib.Config;

class TaskManagerConfig extends Config {

    constructor(...options) {

        super();

        let self = this,
            contextName = this.constructor.name;

        // Private props
        var _bundleConfigsPath = '',
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
                get: function ()  {
                    return _bundleConfigsPath;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_bundlesConfigPath', value, String,
                        'Only strings allowed for self property');
                    _bundleConfigsPath = value;
                },
                enumerable: true
            },
            bundleConfigFormats: {
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_bundleConfigFormats', value, Array);
                    _bundleConfigFormats.addFromArray(value);
                },
                get: function ()  {
                    return _bundleConfigFormats;
                },
                enumerable: true
            },
            localConfigPath: {
                get: function ()  {
                    return _localConfigPath;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_localConfigPath', value, String,
                        'Only strings allowed for self property');
                    _localConfigPath = value;
                },
                enumerable: true
            },
            localConfigBackupPath: {
                get: function ()  {
                    return _localConfigBackupPath;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_localConfigBackupPath', value, String,
                        'Only strings allowed for self property');
                    _localConfigBackupPath = value;
                },
                enumerable: true
            },
            localHelpDocsPath: {
                get: function ()  {
                    return _localHelpDocsPath;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_localHelpDocsPath', value, String,
                        'Only strings allowed for self property');
                    _localHelpDocsPath = value;
                },
                enumerable: true
            },
            helpDocsPath: {
                get: function ()  {
                    return _helpDocsPath;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(
                        contextName, '_helpDocsPath', value, String,
                        'Only strings allowed for self property');
                    _helpDocsPath = value;
                },
                enumerable: true
            },
            taskConfigs: {
                get: function ()  {
                    return _taskConfigs;
                },
                set: function (value)  {
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
                },
                enumerable: true
            },
            staticTaskConfigs: {
                get: function ()  {
                    return _staticTaskConfigs;
                },
                set: function (value)  {
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
                },
                enumerable: true
            }
        });

        this.set(...options);
    }

}

module.exports = TaskManagerConfig;
