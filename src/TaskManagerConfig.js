/**
 * Created by elydelacruz on 10/4/15.
 */

(function () {
    'use strict';

    let Config = require('./Config');

    class TaskManagerConfig extends Config {
        constructor(...options) {
            super({
                bundleConfigsPath: '',
                bundleConfigFormats: [],
                localConfigPath: '',
                localConfigBackupPath: '',
                localHelpPath: '',
                helpPath: '',
                staticTasks: {},
                tasks: {}
            }, ...options)
        }
    }

    module.exports = TaskManagerConfig;
}());
