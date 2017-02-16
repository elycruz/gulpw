/**
 * Created by u067265 on 2/16/17.
 */

'use strict';

let sjl = require('sjljs');

module.exports = function ensureTaskManagerProperty(obj, taskManager) {
    if (Object.hasOwnProperty.call(obj, 'taskManager')) {
        if (taskManager) {
            obj.taskManager = taskManager;
        }
        return obj;
    }

    let _taskManager;
    const out = Object.defineProperty(obj, 'taskManager', {
        get: function () {
            return _taskManager;
        },
        set: function (value) {
            sjl.throwTypeErrorIfNotOfType(contextName, 'taskManager', value, Object);
            _taskManager = value;
        },
        enumerable: true
    });

    out.taskManager = taskManager;

    return out;
};
