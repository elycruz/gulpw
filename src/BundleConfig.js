/**
 * Created by elydelacruz on 10/4/15.
 */
var Config = require('./Config');

module.exports = Config.extend(function BundleConfig(/**options**/) {
    Config.apply(this, [{
            alias: null,
            description: null,
            version: null
        }].concat( sjl.argsToArray(arguments) )
    );
});
