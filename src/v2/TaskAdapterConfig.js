/**
 * Created by elydelacruz on 10/4/15.
 */
var Config = require('./Config');

module.exports = Config.extend(function TaskAdapterConfig(/**options**/) {
    Config.apply(this, [{
            alias: null,
            priority: null,
            alternateTaskName: null,
            constructorLocation: null,
            // list node modules and gulp plugin modules used internally and
            // that are configurable from  your config(s) here.
            // @note TaskAdapter.prototype.getOptionsForBundle will clone any defaults in gulpw-config and
            // merge the `bundle`'s config in with the options
            configurableModules: null
        }].concat( sjl.argsToArray(arguments) )
    );
});
