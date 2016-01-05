/**
 * Created by elydelacruz on 10/4/15.
 */
'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Config = require('./../config/Config'),
    sjl = require('sjljs');

var BundleConfig = (function (_Config) {
    _inherits(BundleConfig, _Config);

    function BundleConfig() {
        _classCallCheck(this, BundleConfig);

        _get(Object.getPrototypeOf(BundleConfig.prototype), 'constructor', this).call(this);
        var _alias = '',
            _description = '',
            _version = '';
        Object.defineProperties(this, {
            alias: {
                get: function get() {
                    return _alias;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(BundleConfig.name, 'alias', value, String);
                    _alias = value;
                }
            },
            description: {
                get: function get() {
                    return _description;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(BundleConfig.name, 'description', value, String);
                    _description = value;
                }
            },
            version: {
                get: function get() {
                    return _version;
                },
                set: function set(value) {
                    sjl.throwTypeErrorIfNotOfType(BundleConfig.name, 'version', value, String);
                    _version = value;
                }
            }
        });

        for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
            options[_key] = arguments[_key];
        }

        sjl.extend.apply(sjl, [true, this].concat(options));
    }

    return BundleConfig;
})(Config);

module.exports = BundleConfig;