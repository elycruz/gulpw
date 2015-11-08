/**
 * Created by elydelacruz on 10/4/15.
 */

var Config = require('./Config');

module.exports = class TaskManagerConfig extends Config {
    constructor () {
        super(...[{
                bundlesPath: null,
                bundleConfigFormats: null,
                localConfigPath: null,
                localConfigBackupPath: null,
                localHelpPath: null,
                helpPath: null,
                staticTasks: null,
                tasks: null
            }].concat(sjl.argsToArray(arguments))
        );
    }
};
