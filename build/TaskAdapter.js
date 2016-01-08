/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var TaskAdapterConfig = require('./TaskAdapterConfig'),
    contextName = 'TaskAdapter';

var TaskAdapter = (function () {
    function TaskAdapter(config, taskManager) {
        _classCallCheck(this, TaskAdapter);

        var _config = {};
        Object.defineProperties(this, {
            taskManager: { value: taskManager },
            config: {
                set: function set(value) {
                    var classOfValue = sjl.classOf(value);
                    if (classOfValue === 'Object') {
                        _config = value instanceof TaskAdapterConfig ? value : new TaskAdapterConfig(value);
                    } else {
                        throw Error('`' + contextName + '.config` only accepts values of type "object" or' + ' of sub-class `TaskAdapterConfig`.  Type recieved: "' + classOfValue + '".');
                    }
                },
                get: function get() {
                    return _config;
                }
            }
        });
        this.config = config;
    }

    _createClass(TaskAdapter, [{
        key: 'registerBundle',
        value: function registerBundle(bundle, taskManager) {
            return this;
        }
    }, {
        key: 'registerBundles',
        value: function registerBundles(bundles, taskManager) {
            return this;
        }
    }, {
        key: 'canRegisterBundle',
        value: function canRegisterBundle(bundle, taskManager) {
            return true;
        }
    }]);

    return TaskAdapter;
})();

module.exports = TaskAdapter;