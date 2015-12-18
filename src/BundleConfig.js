/**
 * Created by elydelacruz on 10/4/15.
 */
'use strict';

let Config = require('./Config'),
    sjl = require('sjljs');

class BundleConfig extends Config {
    constructor(...options) {
        super();
        var _alias = '',
            _description = '',
            _version = '';
        Object.defineProperties(this, {
            alias: {
                get: () => {
                    return _alias;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(BundleConfig.name, 'alias', value, String);
                    _alias = value;
                }
            },
            description: {
                get: () => {
                    return _description;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(BundleConfig.name, 'description', value, String);
                    _description = value;
                }
            },
            version: {
                get: () => {
                    return _version;
                },
                set: (value) => {
                    sjl.throwTypeErrorIfNotOfType(BundleConfig.name, 'version', value, String);
                    _version = value;
                }
            }
        });
        this.options(...options);
    }
}

module.exports = BundleConfig;
