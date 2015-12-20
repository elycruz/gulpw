/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

let sjl = require('sjljs'),
    contextName = 'Config';

class Config {

    constructor(...options) {
        this.set(...options);
    }

    get (keyOrNsKey) {
        if (!sjl.isset(keyOrNsKey)) {
            return this;
        }
        sjl.throwTypeErrorIfNotOfType(contextName, 'get(keyOrNsKey)', keyOrNsKey, String);
        return sjl.getValueFromObj(keyOrNsKey, this);
    }

    set (keyOrNsKey, value) {
        var classOfKey = sjl.classOf(keyOrNsKey),
            self = this;
        if (classOfKey === Object.name) {
            sjl.extend(true, self, ...sjl.argsToArray(arguments), true);
        }
        else if (sjl.isset(keyOrNsKey)) {
            sjl.throwTypeErrorIfNotOfType(contextName, 'set(keyOrNsKey, value)', keyOrNsKey, String);
            sjl.setValueOnObj(keyOrNsKey, value, self);
        }
        else {
            console.warn(contextName + '.set was called with an a null or undefined value.');
        }
        return self;
    }

    has(keyOrNsString/*, type*/) {
        return sjl.isset(sjl.searchObj(keyOrNsString, this)) ? true : false;
    }

    /**
     * toJSON of its own properties or properties found at key/key-namespace-string.
     * @param keyOrNsString {String} - Optional.
     * @returns {*|Config}
     */
    toJSON (keyOrNsString) {
        return sjl.isEmptyOrNotOfType(keyOrNsString, String) ?
            this : sjl.clone(sjl.getValueFromObj(keyOrNsString, this));
    }
}

module.exports = Config;
