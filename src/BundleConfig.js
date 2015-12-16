/**
 * Created by elydelacruz on 10/4/15.
 */
(function () {

    'use strict';

    let Config = require('./Config');

    class BundleConfig extends Config {
        constructor(...options) {
            super({
                alias: '',
                description: '',
                version: ''
            }, ...options);
        }
    }

    module.exports = BundleConfig;

}());
