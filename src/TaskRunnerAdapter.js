/**
 * Created by Ely on 12/18/2015.
 */
'use strict';

let sjl = require('sjljs'),
    contextName = 'TaskRunnerAdapter';

class TaskRunnerAdapter {

    constructor (taskRunner) {
        var _taskRunner = {};
        Object.defineProperty(this, 'taskRunner', {
            get: () => {
                return _taskRunner;
            },
            set: (value) => {
                sjl.throwTypeErrorIfNotOfType(contextName, 'taskRunner', value, Object);
                _taskRunner = value;
            },
            writable: true,
            enumerable: true
        });
        this.taskRunner = taskRunner;
    }

    /**
     * Splits a task runner command/name string into separate parts.  (Splits on ':').
     * @param command {String}
     * @param splitOnChar {String} - Default ':'.
     * @returns {{command: *, taskAlias: *, params: null}}
     */
    splitCommand (command, splitOnChar) {
        splitOnChar = sjl.isEmptyOrNotOfType(splitOnChar, String) ? ':' : splitOnChar;
        var out = {command: command, taskAlias: command, bundle: null, params: null},
            bundle, taskAlias, params, args;
        if (command.indexOf(splitOnChar)) {
            args = command.split(splitOnChar);
            taskAlias = args.shift();
            bundle = args.length > 1 ? args.shift() : null;
            params = args.length > 0 ? args : null;
            out = {taskAlias: taskAlias, bundle: bundle, params: params};
        }
        return out;
    }

    hasTask (key) {
        return false;
    }

    hasCompletedTask (key) {
        return false;
    }

    runTask (key) {
        return this;
    }

    registerTask (taskKey) {
        return this;
    }

    getTask (key) {
        return {};
    }

}

module.exports = TaskRunnerAdapter;
