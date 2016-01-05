/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var sjl = require('sjljs'),
    contextName = 'Config';

var Config = (function () {
    function Config() {
        _classCallCheck(this, Config);

        this.set.apply(this, arguments);
    }

    _createClass(Config, [{
        key: 'get',
        value: function get(keyOrNsKey) {
            if (!sjl.isset(keyOrNsKey)) {
                return this;
            }
            sjl.throwTypeErrorIfNotOfType(contextName, 'get(keyOrNsKey)', keyOrNsKey, String);
            return sjl.getValueFromObj(keyOrNsKey, this);
        }
    }, {
        key: 'set',
        value: function set(keyOrNsKey, value) {
            var classOfKey = sjl.classOf(keyOrNsKey),
                self = this;
            if (classOfKey === Object.name) {
                sjl.extend.apply(sjl, [true, self].concat(_toConsumableArray(sjl.argsToArray(arguments)), [true]));
            } else if (sjl.isset(keyOrNsKey)) {
                sjl.throwTypeErrorIfNotOfType(contextName, 'set(keyOrNsKey, value)', keyOrNsKey, String);
                sjl.setValueOnObj(keyOrNsKey, value, self);
            } else {
                console.warn(contextName + '.set was called with an a null or undefined value.');
            }
            return self;
        }
    }, {
        key: 'has',
        value: function has(keyOrNsString /*, type*/) {
            return sjl.isset(sjl.searchObj(keyOrNsString, this)) ? true : false;
        }

        /**
         * toJSON of its own properties or properties found at key/key-namespace-string.
         * @param keyOrNsString {String} - Optional.
         * @returns {*|Config}
         */
    }, {
        key: 'toJSON',
        value: function toJSON(keyOrNsString) {
            return sjl.isEmptyOrNotOfType(keyOrNsString, String) ? this : sjl.clone(sjl.getValueFromObj(keyOrNsString, this));
        }
    }]);

    return Config;
})();

module.exports = Config;