/**
 * Created by elydelacruz on 2/3/16.
 */
/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

let sjl = require('sjljs'),
    TaskAdapterConfig = require('./TaskAdapterConfig'),
    contextName = 'StaticTaskAdapter';

class StaticTaskAdapter {

    constructor (config, taskManager) {
        var _config = {};
        Object.defineProperties(this, {
            taskManager: {value: taskManager},
            config: {
                set: function (value)  {
                    var classOfValue = sjl.classOf(value);
                    if (classOfValue === 'Object') {
                        _config = value instanceof TaskAdapterConfig ? value :
                            new TaskAdapterConfig(value);
                    }
                    else {
                        throw Error('`' + contextName + '.config` only accepts values of type "object" or' +
                            ' of sub-class `TaskAdapterConfig`.  Type recieved: "' + classOfValue + '".');
                    }
                },
                get: function ()  {
                    return _config;
                }
            }
        });

        // Set config
        if (sjl.isset(config)) {
            this.config = config;
        }
    }

    register () {
        return this;
    }

}

module.exports = StaticTaskAdapter;
