/**
 * Created by Ely on 1/5/2016.
 */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var sjl = require('sjljs'),
    TaskAdapter = require('./TaskAdapter'),
    contextName = 'TaskAdapterManager';

var TaskAdapterManager = (function () {
    function TaskAdapterManager(taskAdapterConfigs) {
        _classCallCheck(this, TaskAdapterManager);

        this.taskAdapters = null;
        Object.defineProperties(this, {
            taskAdapters: {
                value: new sjl.SjlMap()
            }
        });
    }

    _createClass(TaskAdapterManager, [{
        key: 'getTaskAdapter',
        value: function getTaskAdapter(name) {
            return this.taskAdapters.get(name);
        }
    }, {
        key: 'setTaskAdapter',
        value: function setTaskAdapter(taskAdapter) {
            if (taskAdapter instanceof TaskAdapter === false) {
                throw new Error();
            }
            this.taskAdapters.set(taskAdapter.alias, taskAdapter);
        }
    }, {
        key: 'getTaskAdapters',
        value: function getTaskAdapters(aliases) {
            var _this = this;

            var retVal = this.taskAdapters.values();
            if (Array.isArray(aliases) && aliases.length > 0) {
                retVal = sjl.iterable(aliases.map(function (name) {
                    return _this.taskAdapters.get(name);
                }, this));
            }
            return retVal;
        }
    }, {
        key: 'setTaskAdapters',
        value: function setTaskAdapters(taskAdapters) {
            var _this2 = this;

            taskAdapters.forEach(function (taskAdapter) {
                _this2.setTaskAdapter(taskAdapter.alias, taskAdapter);
            }, this);
            return this;
        }
    }, {
        key: 'addFromTaskAdapterConfigs',
        value: function addFromTaskAdapterConfigs(taskAdapterConfigs) {
            var _this3 = this;

            var it;
            if (!(taskAdapterConfig instanceof Map) && !(taskAdapterConfgs instanceof sjl.ObjectIterator)) {
                it = sjl.iterable(taskAdapterConfigs);
            }
            it.forEach(function (key, value) {
                _this3.setTaskAdapter(key, value);
            }, this);
            return this;
        }
    }]);

    return TaskAdapterManager;
})();