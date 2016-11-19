/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

let sjl = require('sjljs'),
    Config = sjl.ns.stdlib.Config,
    throwErrorIfNotType = sjl.curry4(sjl.throwTypeErrorIfNotOfType, 'Bundle'),
    throwErrorIfNotString = (alias, value) => throwErrorIfNotType(alias, value, String);

class Bundle extends Config {
    constructor(...options) {
        super();
        var _alias = '',
            _description = '',
            _version = '';
        Object.defineProperties(this, {
            alias: {
                get: function ()  {
                    return _alias;
                },
                set: function (value)  {
                    throwErrorIfNotString('alias', value);
                    _alias = value;
                },
                enumerable: true
            },
            description: {
                get: function ()  {
                    return _description;
                },
                set: function (value)  {
                    throwErrorIfNotString('description', value);
                    _description = value;
                },
                enumerable: true
            },
            version: {
                get: function ()  {
                    return _version;
                },
                set: function (value)  {
                    throwErrorIfNotString('version', value);
                    _version = value;
                },
                enumerable: true
            }
        });
        sjl.extend.call(sjl, true, this, ...options);
    }
}

module.exports = Bundle;
