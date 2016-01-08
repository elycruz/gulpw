/**
 * Created by elydelacruz on 10/4/15.
 * @todo Figure out if we need to create an `TaskManagerEnv` object to enforce that the inner used properties are set
 */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TaskAdapter = require('./TaskAdapter'),
    TaskManagerConfig = require('./TaskManagerConfig'),
    TaskRunnerAdapter = require('./TaskRunnerAdapter'),
    Bundle = require('./Bundle'),
    sjl = require('sjljs'),
    SjlSet = sjl.SjlSet,
    SjlMap = sjl.SjlMap,
    gwUtils = require('./Utils'),
    chalk = require('chalk'),
    path = require('path'),
    fs = require('fs'),
    contextName = 'TaskManager';

var _log;

var TaskManager = (function (_TaskManagerConfig) {
    _inherits(TaskManager, _TaskManagerConfig);

    function TaskManager(config) {
        var _this = this;

        _classCallCheck(this, TaskManager);

        // Call super
        _get(Object.getPrototypeOf(TaskManager.prototype), 'constructor', this).call(this);

        // Private variables that we expose to the outside start with `_`
        var self = this,
            _argv = {},
            _configBase = '',
            _configPath = '',
            _cwd = '',
            _pwd = '',
            _taskRunnerAdapter = {};

        // Define properties
        Object.defineProperties(self, {
            argv: {
                get: function get() {
                    return _argv;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_argv', value, Object);
                    _argv = value;
                }
            },
            availableBundleNames: {},
            availableTaskNames: {},
            availableStaticTaskNames: {},
            bundles: {
                value: new SjlMap()
            },
            bundleFileNames: {
                value: new SjlSet()
            },
            sessionBundleNames: {
                value: new SjlSet()
            },
            configBase: {
                get: function get() {
                    return _configBase;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_configBase', value, String, 'Only strings are allowed for this property');
                    _configBase = value;
                }
            },
            commands: {
                value: new SjlSet()
            },
            configPath: {
                get: function get() {
                    return _configPath;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_configPath', value, String, 'Only strings are allowed for this property');
                    _configPath = value;
                }
            },
            config: {
                value: config
            },
            errorReports: {
                value: new SjlMap()
            },
            warningReports: {
                value: new SjlMap()
            },
            durationReports: {
                value: new SjlMap()
            },
            taskAdapters: {
                value: new Map()
            },
            sessionTaskNames: {
                value: new SjlSet()
            },
            splitCommands: {
                value: new Map()
            },
            staticTaskAdapters: {
                value: new Map()
            },
            sessionStaticTaskNames: {
                value: new SjlSet()
            },
            taskRunnerAdapter: {
                get: function get() {
                    return _taskRunnerAdapter;
                },
                set: function set(value) {
                    var retVal = _this;
                    if (value && value instanceof TaskRunnerAdapter) {
                        _taskRunnerAdapter = value;
                    } else if (value && value instanceof TaskRunnerAdapter === false) {
                        throw new TypeError(contextName + '.taskRunnerAdapter only accepts types of `TaskRunnerAdapter` or ' + 'subclasses of `TaskRunnerAdapter`.  Type recieved: \'' + sjl.classOf(value) + '\'.');
                    }
                }
            },
            cwd: {
                get: function get() {
                    return _cwd;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_cwd', value, String);
                    _cwd = value;
                }
            },
            pwd: {
                get: function get() {
                    return _pwd;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, '_pwd', value, String);
                    _pwd = value;
                }
            }
        });

        // Set log function
        _log = gwUtils.logger(this.argv, this);
        this.set(config);
    }

    /**
     * @todo add unknown bundle-name, task-name, and static-task-name warnings
     */

    _createClass(TaskManager, [{
        key: 'init',
        value: function init() {
            var _this2 = this;

            // If no CLI arguments supplied exit,
            if (sjl.empty(this.argv)) {
                _log(chalk.yellow('! No arguments supplied.'));
                return this;
            }

            var splitCommandOn = ':',
                bundleFileNames = this.bundleFileNames.addFromArray(fs.readdirSync(this.config.bundlesPath)),
                availableTaskNames = this.availableTaskNames.addFromArray(Object.keys(this.config.tasks)),
                availableStaticTaskNames = this.availableStaticTaskNames(Object.keys(this.config.staticTasks)),
                availableBundleNames = this.availableBundleNames.addFromArray(bundleFileNames.map(function (fileName) {
                return fileName.split(/\.(?:json|js|yaml|yml)$/)[0];
            })),
                addedBundleNames = this.sessionBundleNames,
                addedTaskNames = this.sessionTaskNames,
                addedStaticTaskNames = this.sessionStaticTaskNames;

            // Get split commands
            this.argv._.forEach(function (value) {
                var splitCommand = _this2.taskRunnerAdapter.splitCommand(value, splitCommandOn),
                    bundle = splitCommand.bundle,
                    command = splitCommand.command,
                    taskName = splitCommand.taskAlias,
                    taskAdapter = undefined,
                    staticTaskAdapter = undefined;

                // Task Names
                if (!sjl.isEmptyOrNotOfType(taskName, String) && availableTaskNames.has(taskName) && !addedTaskNames.has(taskName)) {
                    addedTaskNames.add(taskName);
                    taskAdapter = _this2._initTaskAdapter(taskName, _this2.config.tasks[taskName]);
                } else {
                    throw new Error('An error occurred before registering task name "' + taskName + '".' + '  Either the task name is empty, not of the correct type, or the task name was not found in ' + '`available task names`.');
                }

                // Static Task Names
                if (sjl.classOfIs(command, String) && command.indexOf(splitCommandOn) === -1 && !availableTaskNames.has(command) && availableStaticTaskNames.has(command) && !addedStaticTaskNames.has(command)) {
                    addedStaticTaskNames.add(command);
                    staticTaskAdapter = _this2._initStaticTaskAdapter(taskName, _this2.config.staticTasks[taskName]);
                } else {
                    throw new Error('An error occurred before registering staticTaskName name "' + taskName + '".' + '  Either the staticTaskName name is empty, not of the correct type, or the staticTaskName was not found in ' + '`available staticTaskNames`.');
                }

                // Bundle Names
                if (!sjl.isEmptyOrNotOfType(bundle, String) && availableBundleNames.indexOf(bundle) > -1 && !addedBundleNames.has(bundle)) {
                    addedBundleNames.add(bundle);
                    var bundleObj = _this2._initBundle(bundle, gwUtils.loadConfigFileFromSupportedExts(path.join(_this2.cwd, _this2.configs.bundlesPath, bundle)));

                    // Register bundle with task adapter or static task adapter
                    if (taskAdapter) {
                        taskAdapter.registerBundle(bundleObj);
                    } else if (staticTaskAdapter) {
                        staticTaskAdapter.registerBundle(bundleObj);
                    }
                } else {
                    throw new Error('An error occurred before registering bundle name "' + bundle + '".' + '  Either the bundle name is empty, not of the correct type, or the bundle was not found in ' + '`available bundles`.');
                }

                // Split commands
                _this2.splitCommands.set(command, splitCommand);
            }, this);

            // Clear memory
            availableStaticTaskNames = null;
            availableTaskNames = null;
            availableBundleNames = null;
            addedBundleNames = null;
            addedStaticTaskNames = null;
            addedTaskNames = null;
            bundleFileNames = null;
            splitCommandOn = null;

            // Ensure globally called tasks adapters are invoked globally as well
            return this._ensureInvokedGlobalTasks();
        }
    }, {
        key: 'getTaskAdapter',
        value: function getTaskAdapter(taskName) {
            var taskAdapter,
                hasTaskName = this.availableTaskNames.has(taskName),
                taskNameNotRegistered = this.sessionTaskNames.has(taskName);
            if (hasTaskName) {
                if (taskNameNotRegistered) {
                    taskAdapter = this._initTaskAdapter(taskName, this.config.tasks[taskName]);
                } else {
                    taskAdapter = this.taskAdapters.get(taskName);
                }
            } else {
                throw new Error('`' + contextName + '.getTaskAdapter` doesn\'t have a task ' + 'available for task name "' + taskName + '".  Available task names: \n - ' + sjl.implode(this.availableTaskNames, '\n - ') + '.');
            }
            return taskAdapter;
        }
    }, {
        key: 'isTaskRegistered',
        value: function isTaskRegistered(task) {
            return this.taskRunnerAdapter.has(task);
        }
    }, {
        key: 'launchTasks',
        value: function launchTasks(taskCommands) {
            return this;
        }
    }, {
        key: 'launchTasksSync',
        value: function launchTasksSync(taskCommands) {
            return this;
        }
    }, {
        key: 'log',
        value: function log() {
            return _log.apply(undefined, _toConsumableArray(sjl.argsToArray(arguments)));
        }
    }, {
        key: '_initTaskAdapter',
        value: function _initTaskAdapter(taskName, taskConfig) {
            taskConfig.alias = taskName;
            var FetchedTaskAdapterClass = require(path.join(this.cwd, taskConfig.constructorLocation)),
                taskAdapter = new FetchedTaskAdapterClass(taskConfig, this);
            this.taskAdapters.set(taskName, taskAdapter);
            return taskAdapter;
        }
    }, {
        key: '_initBundle',
        value: function _initBundle(bundleName, bundleConfig) {
            bundleConfig.alias = bundleName;
            var bundleObj = new Bundle(bundleConfig);
            this.bundles.set(bundleName, bundleObj);
            return bundleObj;
        }
    }, {
        key: '_initStaticTaskAdapter',
        value: function _initStaticTaskAdapter(staticTaskName, staticTaskConfig) {
            staticTaskConfig.alias = staticTaskName;
            var FetchedStaticTaskAdapterClass = require(path.join(this.cwd, staticTaskConfig.constructorLocation)),
                staticTaskAdapter = new FetchedStaticTaskAdapterClass(staticTaskConfig, this);
            this.staticTaskAdapters.set(staticTaskName, staticTaskAdapter);
            return staticTaskAdapter;
        }
    }, {
        key: '_ensureInvokedGlobalTasks',
        value: function _ensureInvokedGlobalTasks() {
            // Ensure globally called tasks are called
            this.splitCommands.forEach(function (commandMeta) {
                if (commandMeta.bundle || !this.sessionTaskNames.has(commandMeta.taskAlias)) {
                    return;
                }
                this.getTaskAdapter(commandMeta.taskAlias).registerBundles(this.bundles, this);
            }, this);
            return this;
        }
    }]);

    return TaskManager;
})(TaskManagerConfig);

module.exports = TaskManager;