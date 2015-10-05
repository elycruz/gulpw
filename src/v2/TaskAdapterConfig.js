/**
 * Created by elydelacruz on 10/4/15.
 */
var Config = require('./Config');

module.exports = Config.extend(function TaskAdapterConfig(/**options**/) {
    Config.apply(this, [{
            alias: null,
            priority: null,
            alternateTaskName: null,
            constructorLocation: null
        }].concat( sjl.argsToArray(arguments) )
    );
});
