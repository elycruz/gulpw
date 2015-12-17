/**
 * Created by elydelacruz on 10/4/15.
 */

(function () {

    'use strict';

    let sjl = require('sjljs');

    class Config {

        constructor(...options) {
            let _options = {};
            Object.defineProperty(this, '_options', {
                get: function () {
                    return _options;
                },
                configurable: true
            });
            this.options(...options);
        }

        options(...objects) {
            var self = this,
                retVal;
            if (objects.length > 0) {
                sjl.extend(true, this._options, ...objects);
                retVal = self;
            }
            else {
                retVal = this._options;
            }
            return retVal;
        }

        /**
         * Overloaded getter and setter for options keys set on `Config`.
         * @param key {String}
         * @param value {*}
         * @returns {Config}
         */
        option(key, value) {
            var isGetterCall = !( !sjl.isEmptyOrNotOfType(key, String) && sjl.isset(value) ),
                retVal = this;
            if (isGetterCall) {
                retVal = sjl.searchObj(key, this._options);
            }
            else {
                sjl.namespace(key, this._options, value);
            }
            return retVal;
        }

        has(keyOrNsString) {
            return sjl.isset(sjl.searchObj(keyOrNsString, this._options)) ? true : false;
        }
    }

    module.exports = Config;

}());
