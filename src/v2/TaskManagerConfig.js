/**
 * Created by elydelacruz on 10/4/15.
 */

var Config = require('./Config');

module.exports = Config.extend(function TaskManagerConfig(/** options **/) {
    Config.apply(this, [{
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
});
