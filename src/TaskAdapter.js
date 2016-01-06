/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

let TaskManager = require('TaskManager'),
    TaskAdapterConfig = require('TaskAdapterConfig'),
    contextName = 'TaskAdapter';

class TaskAdapter {

    config (config) {
        var retVal = this;
        if (!sjl.isset(config)) {
            retVal = this._config;
        }
        else {
            this._config = config;
        }
        return retVal;
    }
    
    taskManager (taskManager) {
        var retVal = this;
        if (!sjl.isset(taskManager)) {
            retVal = this._taskManager;
        }
        else {
            this._taskManager = taskManager;
        }
        return retVal;
    }

    constructor (config, taskManager) {
        var _config = {},
            _taskManager = {};
        Object.defineProperties(this, {
            _taskManager: {
                set: (value) => {
                    if (value instanceof TaskManager === false) {
                        throw Error('`' + contextName + '._taskManager` only accepts values that' +
                            ' are instance-of or sub-class of `TaskManager`.');
                    }
                    _taskManager = value;
                },
                get: () => {
                    return _taskManager;
                }
            },
            _config: {
                set: (value) => {
                    if (value instanceof TaskAdapterConfig === false) {
                        throw Error('`' + contextName + '._config` only accepts values that' +
                            ' are instance-of or sub-class of `TaskAdapterConfig`.');
                    }
                    _config = value;
                },
                get: () => {
                    return _config;
                }
            }
        });
        this._config = config;
        this._taskManager = taskManager;
    }

    registerBundle (bundle, taskManager) {
        return this;
    }

    registerBundles (bundles, taskManager) {
        return this;
    }

    canRegisterBundle (bundle, taskManager) {
        return true;
    }
}

module.exports = TaskAdapter;
