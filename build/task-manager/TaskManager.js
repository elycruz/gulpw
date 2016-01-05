/**
 * Created by elydelacruz on 10/4/15.
 * @todo Figure out if we need to create an `TaskManagerEnv` object to enforce that the inner used properties are set
 */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TaskManagerConfig = require('./TaskManagerConfig'),
    TaskRunnerAdapter = require('./../task-runner/TaskRunnerAdapter'),
    sjl = require('sjljs'),
    SjlSet = sjl.ns.stdlib.SjlSet,
    SjlMap = sjl.ns.stdlib.SjlMap,
    contextName = 'TaskManager';

var TaskManager = (function (_TaskManagerConfig) {
    _inherits(TaskManager, _TaskManagerConfig);

    _createClass(TaskManager, [{
        key: 'taskAdapters',
        value: function taskAdapters(_taskAdapters2) {
            var retVal = this;
            if (_taskAdapters2) {
                this._taskAdapters = _taskAdapters2;
            } else {
                retVal = this._taskAdapters;
            }
            return retVal;
        }
    }, {
        key: 'taskNames',
        value: function taskNames(_taskNames2) {
            var retVal = this;
            if (_taskNames2) {
                this._taskNames = _taskNames2;
            } else {
                retVal = this._taskNames;
            }
            return retVal;
        }
    }, {
        key: 'staticTaskAdapters',
        value: function staticTaskAdapters(_staticTaskAdapters2) {
            var retVal = this;
            if (_staticTaskAdapters2) {
                this._staticTaskAdapters = _staticTaskAdapters2;
            } else {
                retVal = this._staticTaskAdapters;
            }
            return retVal;
        }
    }, {
        key: 'staticTaskNames',
        value: function staticTaskNames(_staticTaskNames2) {
            var retVal = this;
            if (_staticTaskNames2) {
                this._staticTaskNames = _staticTaskNames2;
            } else {
                retVal = this._staticTaskNames;
            }
            return retVal;
        }
    }, {
        key: 'taskRunnerAdapter',
        value: function taskRunnerAdapter(_taskRunnerAdapter2) {
            var retVal = this;
            if (_taskRunnerAdapter2 && _taskRunnerAdapter2 instanceof TaskRunnerAdapter) {
                this._taskRunnerAdapter = _taskRunnerAdapter2;
            } else if (_taskRunnerAdapter2 && _taskRunnerAdapter2 instanceof TaskRunnerAdapter === false) {
                throw new TypeError(contextName + '.taskRunnerAdapter only accepts types of `TaskRunnerAdapter` or ' + 'subclasses of `TaskRunnerAdapter`.  Type recieved: \'' + sjl.classOf(_taskRunnerAdapter2) + '\'.');
            } else {
                retVal = this._taskRunnerAdapter;
            }
            return retVal;
        }
    }, {
        key: 'taskRunner',
        value: function taskRunner(_taskRunner2) {
            var retVal = this;
            if (_taskRunner2) {
                this._taskRunner = _taskRunner2;
            } else {
                retVal = this._taskRunner;
            }
            return retVal;
        }
    }, {
        key: 'configPath',
        value: function configPath(_configPath2) {
            var retVal = this;
            if (_configPath2) {
                this._configPath = _configPath2;
            } else {
                retVal = this._configPath;
            }
            return retVal;
        }
    }, {
        key: 'configBase',
        value: function configBase(_configBase2) {
            var retVal = this;
            if (_configBase2) {
                this._configBase = _configBase2;
            } else {
                retVal = this._configBase;
            }
            return retVal;
        }
    }, {
        key: 'argv',
        value: function argv(_argv2) {
            var retVal = this;
            if (_argv2) {
                this._argv = _argv2;
            } else {
                retVal = this._argv;
            }
            return retVal;
        }
    }, {
        key: 'cwd',
        value: function cwd(_cwd2) {
            var retVal = this;
            if (_cwd2) {
                this._cwd = _cwd2;
            } else {
                retVal = this._cwd;
            }
            return retVal;
        }
    }, {
        key: 'pwd',
        value: function pwd(_pwd2) {
            var retVal = this;
            if (_pwd2) {
                this._pwd = _pwd2;
            } else {
                retVal = this._pwd;
            }
            return retVal;
        }
    }]);

    function TaskManager(taskRunner, argv, env, config) {
        _classCallCheck(this, TaskManager);

        // Call super
        _get(Object.getPrototypeOf(TaskManager.prototype), 'constructor', this).call(this);

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
                get: function get() {
                    return _taskAdapters;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_taskAdapters', value, Object);
                    _taskAdapters = new SjlMap(value);
                }
            },
            _taskNames: {
                get: function get() {
                    return _taskNames;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_taskNames', value, String);
                    _taskNames = new SjlSet(value);
                }
            },
            _staticTaskAdapters: {
                get: function get() {
                    return _staticTaskAdapters;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_staticTaskAdapters', value, Object);
                    _staticTaskAdapters = new SjlMap(value);
                }
            },
            _staticTaskNames: {
                get: function get() {
                    return _staticTaskNames;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_staticTaskNames', value, Array);
                    _staticTaskNames = new SjlSet(value);
                }
            },
            _taskRunner: {
                get: function get() {
                    return _taskRunner;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_taskRunner', value, Object);
                    _taskRunner = value;
                }
            },
            _taskRunnerAdapter: {
                get: function get() {
                    return _taskRunnerAdapter;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_taskRunnerAdapter', value, Object);
                    _taskRunnerAdapter = value;
                }
            },
            _configPath: {
                get: function get() {
                    return _configPath;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_configPath', value, String, 'Only strings are allowed for this property');
                    _configPath = value;
                }
            },
            _configBase: {
                get: function get() {
                    return _configBase;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_configBase', value, String, 'Only strings are allowed for this property');
                    _configBase = value;
                }
            },
            _argv: {
                get: function get() {
                    return _argv;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_argv', value, Object);
                    _argv = value;
                }
            },
            _cwd: {
                get: function get() {
                    return _cwd;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_cwd', value, String);
                    _cwd = value;
                }
            },
            _pwd: {
                get: function get() {
                    return _pwd;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_pwd', value, String);
                    _pwd = value;
                }
            }
        });

        // Set some more params and initiate run sequence
        self.cwd(env.configBase).pwd(env.pwd).argv(argv).configPath(env.configPath).set(config).initRunSequence(self);
    }

    _createClass(TaskManager, [{
        key: 'initRunSequence',
        value: function initRunSequence(self) {
            console.log('Beginning run sequence', self);
        }

        //getTaskAdapter(taskName) {
        //}
        //
        //registerBundleConfigs(bundleConfigs) {
        //}
        //
        //registerBundleConfigWithTask(bundleConfig, taskName) {
        //}
        //
        //registerBundleConfigWithTasks(bundleConfig, taskNames) {
        //}
        //
        //registerBundleConfigsWithTasks(bundleConfigs, taskNames) {
        //}
        //
        //isTaskRegisteredWithTaskRunner(taskName) {
        //}
        //
        //_createTaskAdapter(taskName) {
        //}
        //
        //_createTaskAdapters(taskNames) {
        //}
        //
        //_createStaticTaskAdapter(staticTaskName) {
        //}
        //
        //_createStaticTaskAdapters(staticTaskNames) {
        //}
        //
        //_createBundleConfig(bundleConfigObj) {
        //}
        //
        //_createBundleConfigs(bundleConfigObjs, registerWithTaskAdapters) {
        //}
        //
        //_setTaskAdapter(taskName, taskAdapter) {
        //}

    }]);

    return TaskManager;
})(TaskManagerConfig);

module.exports = TaskManager;