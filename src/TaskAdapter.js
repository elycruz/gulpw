/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

let sjl = require('sjljs'),
    TaskAdapterConfig = require('./TaskAdapterConfig');

class TaskAdapter {

    constructor (config, taskManager) {
        let contextName = this.constructor.name;
        let _config = {};
        Object.defineProperties(this, {
            taskManager: {
                value: taskManager,
                enumerable: true
            },
            config: {
                set: function (value)  {
                    let classOfValue = sjl.classOf(value);
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
                },
                enumerable: true
            }
        });
        if (config) {
            this.config = config;
        }
    }

    /**
     * @param bundle {Object}
     * @param [taskManager]
     * @param [config]
     * @returns {TaskAdapter}
     */
    registerBundle (bundle, taskManager, config) {
        return this;
    }

    /**
     * @param bundles {Array}
     * @param [taskManager]
     * @param [config]
     * @returns {TaskAdapter}
     */
    registerBundles (bundles, taskManager, config) {
        return this;
    }

    /**
     * @param bundle {Object}
     * @param [taskManager]
     * @returns {boolean}
     */
    canRegisterBundle (bundle, taskManager) {
        return true;
    }

}

module.exports = TaskAdapter;
