/**
 * Created by Ely on 12/18/2015.
 */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var sjl = require('sjljs'),
    contextName = 'TaskRunnerAdapter';

var TaskRunnerAdapter = (function () {
    function TaskRunnerAdapter(taskRunner) {
        _classCallCheck(this, TaskRunnerAdapter);

        var _taskRunner = {};
        Object.defineProperty(this, 'taskRunner', {
            get: function get() {
                return _taskRunner;
            },
            set: function set(value) {
                sjl.throwTypeErrorIfNotOfType(contextName, 'taskRunner', value, Object);
                _taskRunner = value;
            },
            writable: true,
            enumerable: true
        });
        this.taskRunner = taskRunner;
    }

    /**
     * Splits a task runner command/name string into separate parts.  (Splits on ':').
     * @param command {String}
     * @param splitOnChar {String} - Default ':'.
     * @returns {{command: *, taskAlias: *, params: null}}
     */

    _createClass(TaskRunnerAdapter, [{
        key: 'splitCommand',
        value: function splitCommand(command, splitOnChar) {
            splitOnChar = sjl.isEmptyOrNotOfType(splitOnChar, String) ? ':' : splitOnChar;
            var out = { command: command, taskAlias: command, bundle: null, params: null },
                bundle,
                taskAlias,
                params,
                args;
            if (command.indexOf(splitOnChar)) {
                args = command.split(splitOnChar);
                taskAlias = args.shift();
                bundle = args.length > 1 ? args.shift() : null;
                params = args.length > 0 ? args : null;
                out = { taskAlias: taskAlias, bundle: bundle, params: params };
            }
            return out;
        }
    }, {
        key: 'hasTask',
        value: function hasTask(key) {
            return false;
        }
    }, {
        key: 'hasCompletedTask',
        value: function hasCompletedTask(key) {
            return false;
        }
    }, {
        key: 'runTask',
        value: function runTask(key) {
            return this;
        }
    }, {
        key: 'registerTask',
        value: function registerTask(taskKey) {
            return this;
        }
    }, {
        key: 'getTask',
        value: function getTask(key) {
            return {};
        }
    }]);

    return TaskRunnerAdapter;
})();

module.exports = TaskRunnerAdapter;