/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

let sjl = require('sjljs');

class Config {

    constructor(...options) {
        this.options(...options);
    }

    options(...objects) {
        var self = this,
            retVal;
        if (objects.length > 0) {
            sjl.extend(true, this, ...objects);
            retVal = self;
        }
        else {
            retVal = this;
        }
        return retVal;
    }

    option(key, value) {
        var isGetterCall = !( !sjl.isEmptyOrNotOfType(key, String) && sjl.isset(value) ),
            retVal = this;
        if (isGetterCall) {
            retVal = sjl.searchObj(key, this);
        }
        else {
            sjl.namespace(key, this, value);
        }
        return retVal;
    }

    has(keyOrNsString) {
        return sjl.isset(sjl.searchObj(keyOrNsString, this)) ? true : false;
    }

    cloneFromKey(keyOrNsString) {
        return sjl.jsonClone(this.option(keyOrNsString));
    }
}

module.exports = Config;
