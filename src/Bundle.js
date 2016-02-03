/**
 * Created by elydelacruz on 10/4/15.
 */
'use strict';

let Config = require('./Config'),
    sjl = require('sjljs');

class Bundle extends Config {
    constructor(/**...options {Object} **/) {
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
                    sjl.throwTypeErrorIfNotOfType(Bundle.name, 'alias', value, String);
                    _alias = value;
                }
            },
            description: {
                get: function ()  {
                    return _description;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(Bundle.name, 'description', value, String);
                    _description = value;
                }
            },
            version: {
                get: function ()  {
                    return _version;
                },
                set: function (value)  {
                    sjl.throwTypeErrorIfNotOfType(Bundle.name, 'version', value, String);
                    _version = value;
                }
            }
        });
        sjl.extend(true, this, ...arguments);
    }
}

module.exports = Bundle;
