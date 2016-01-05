/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var sjl = require('sjljs'),
    stdlib = sjl.ns.stdlib,
    SjlMap = stdlib.SjlMap,
    SjlSet = stdlib.SjlSet,
    Config = require('./../config/Config'),
    contextName = 'TaskManagerConfig';

var TaskManagerConfig = (function (_Config) {
    _inherits(TaskManagerConfig, _Config);

    function TaskManagerConfig() {
        _classCallCheck(this, TaskManagerConfig);

        _get(Object.getPrototypeOf(TaskManagerConfig.prototype), 'constructor', this).call(this);

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
                get: function get() {
                    return _bundleConfigsPath;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_bundlesConfigPath', value, String, 'Only strings allowed for self property');
                    _bundleConfigsPath = value;
                }
            },
            _bundleConfigFormats: {
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_bundleConfigFormats', value, Array);
                    _bundleConfigFormats.addFromArray(value);
                },
                get: function get() {
                    return _bundleConfigFormats;
                }
            },
            _localConfigPath: {
                get: function get() {
                    return _localConfigPath;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_localConfigPath', value, String, 'Only strings allowed for self property');
                    _localConfigPath = value;
                }
            },
            _localConfigBackupPath: {
                get: function get() {
                    return _localConfigBackupPath;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_localConfigBackupPath', value, String, 'Only strings allowed for self property');
                    _localConfigBackupPath = value;
                }
            },
            _localHelpDocsPath: {
                get: function get() {
                    return _localHelpDocsPath;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_localHelpDocsPath', value, String, 'Only strings allowed for self property');
                    _localHelpDocsPath = value;
                }
            },
            _helpDocsPath: {
                get: function get() {
                    return _helpDocsPath;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_helpDocsPath', value, String, 'Only strings allowed for self property');
                    _helpDocsPath = value;
                }
            },
            _taskConfigs: {
                get: function get() {
                    return _taskConfigs;
                },
                set: function set(value) {
                    var classOfValue = sjl.classOf(value);
                    if (classOfValue === 'Object') {
                        _taskConfigs = new SjlMap(value);
                    } else if (classOfValue === 'SjlMap') {
                        _taskConfigs = value;
                    } else {
                        throw new TypeError('`' + contextName + '._taskConfigs` only takes types of `SjlMap` and/or ' + 'types of `Object`.  Type received: `' + classOfValue + '`.');
                    }
                }
            },
            _staticTaskConfigs: {
                get: function get() {
                    return _staticTaskConfigs;
                },
                set: function set(value) {
                    var classOfValue = sjl.classOf(value);
                    if (classOfValue === 'Object') {
                        _staticTaskConfigs = new SjlMap(value);
                    } else if (classOfValue === 'SjlMap') {
                        _staticTaskConfigs = value;
                    } else {
                        throw new TypeError('`' + contextName + '._staticTaskConfigs` only takes types of `SjlMap` and/or ' + 'types of `Object`.  Type received: `' + classOfValue + '`.');
                    }
                }
            }
        });

        this.set.apply(this, arguments);
    }

    _createClass(TaskManagerConfig, [{
        key: 'bundleConfigsPath',
        value: function bundleConfigsPath(_bundleConfigsPath2) {
            var retVal = this;
            if (typeof _bundleConfigsPath2 === 'undefined') {
                retVal = this._bundleConfigsPath;
            } else {
                this._bundleConfigsPath = _bundleConfigsPath2;
            }
            return retVal;
        }
    }, {
        key: 'bundleConfigFormats',
        value: function bundleConfigFormats(_bundleConfigFormats2) {
            var retVal = this;
            if (_bundleConfigFormats2) {
                this._bundleConfigFormats = _bundleConfigFormats2;
            } else {
                retVal = this._bundleConfigFormats;
            }
            return retVal;
        }
    }, {
        key: 'localConfigPath',
        value: function localConfigPath(_localConfigPath2) {
            var retVal = this;
            if (_localConfigPath2) {
                this._localConfigPath = _localConfigPath2;
            } else {
                retVal = this._localConfigPath;
            }
            return retVal;
        }
    }, {
        key: 'localConfigBackupPath',
        value: function localConfigBackupPath(_localConfigBackupPath2) {
            var retVal = this;
            if (_localConfigBackupPath2) {
                this._localConfigBackupPath = _localConfigBackupPath2;
            } else {
                retVal = this._localConfigBackupPath;
            }
            return retVal;
        }
    }, {
        key: 'localHelpDocsPath',
        value: function localHelpDocsPath(_localHelpDocsPath2) {
            var retVal = this;
            if (_localHelpDocsPath2) {
                this._localHelpDocsPath = _localHelpDocsPath2;
            } else {
                retVal = this._localHelpDocsPath;
            }
            return retVal;
        }
    }, {
        key: 'helpDocsPath',
        value: function helpDocsPath(_helpDocsPath2) {
            var retVal = this;
            if (_helpDocsPath2) {
                this._helpDocsPath = _helpDocsPath2;
            } else {
                retVal = this._helpDocsPath;
            }
            return retVal;
        }
    }, {
        key: 'taskConfigs',
        value: function taskConfigs(_taskConfigs2) {
            var retVal = this;
            if (_taskConfigs2) {
                this._taskConfigs = _taskConfigs2;
            } else {
                retVal = this._taskConfigs;
            }
            return retVal;
        }
    }, {
        key: 'staticTaskConfigs',
        value: function staticTaskConfigs(_staticTaskConfigs2) {
            var retVal = this;
            if (_staticTaskConfigs2) {
                this._staticTaskConfigs = _staticTaskConfigs2;
            } else {
                retVal = this._staticTaskConfigs;
            }
            return retVal;
        }
    }]);

    return TaskManagerConfig;
})(Config);

module.exports = TaskManagerConfig;