/**
 * Created by elydelacruz on 10/4/15.
 */
'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Config = require('./Config');

var TaskAdapterConfig = (function (_Config) {
    _inherits(TaskAdapterConfig, _Config);

    function TaskAdapterConfig() {
        _classCallCheck(this, TaskAdapterConfig);

        _get(Object.getPrototypeOf(TaskAdapterConfig.prototype), 'constructor', this).call(this);

        for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
            options[_key] = arguments[_key];
        }

        this.set.apply(this, [{
            alias: '',
            priority: 0,
            alternateTaskName: '',
            constructorLocation: '',
            // list node modules and task runner (gulp) plugin modules used internally and
            // that are configurable from  your config(s) here.
            // @note TaskAdapter.prototype.getOptionsForBundle will clone any defaults in gulpw-config and
            // merge the `bundle`'s config in with the options
            configurableModules: []
        }].concat(options));
    }

    return TaskAdapterConfig;
})(Config);

module.exports = TaskAdapterConfig;