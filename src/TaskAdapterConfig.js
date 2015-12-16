/**
 * Created by elydelacruz on 10/4/15.
 */
(function () {
    'use strict';

    let Config = require('./Config');

    class TaskAdapterConfig extends Config {
        constructor(...options) {
            this.options({
                alias: '',
                priority: 0,
                alternateTaskName: '',
                constructorLocation: '',
                // list node modules and task runner (gulp) plugin modules used internally and
                // that are configurable from  your config(s) here.
                // @note TaskAdapter.prototype.getOptionsForBundle will clone any defaults in gulpw-config and
                // merge the `bundle`'s config in with the options
                configurableModules: []
            }, ...options)
        }
    }

    module.exports = TaskAdapterConfig;

}());
