/**
 * Created by elydelacruz on 10/4/15.
 */
(function () {

    'use strict';

    let sjl = require('sjljs');

    class Config {
        constructor(...options) {
            this.options(...options);
        }

        options(...objects) {
            var self = this,
                retVal,
                out;
            if (objects.length > 0) {
                sjl.extend.apply(sjl, objects);
                retVal = self;
            }
            else {
                out = {};
                retVal = Object.keys(self).forEach(function (key) {
                    out[key] = self[key];
                });
            }
            return retVal;
        }

        option(key, value) {
            var isGetterCall = !( !sjl.isEmptyOrNotOfType(key, String) && sjl.isset(value) ),
                retVal = this;
            if (isGetterCall) {
                retVal = sjl.searchObj(this, key);
            }
            else {
                retVal = sjl.namespace(this, key, value);
            }
            return retVal;
        }

        has(keyOrNsString) {
            return sjl.isset(sjl.searchObj(this, keyOrNsString)) ? true : false;
        }
    }

    module.exports = Config;

}());
