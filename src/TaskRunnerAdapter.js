/**
 * Created by Ely on 12/18/2015.
 */
'use strict';

let sjl = require('sjljs');

class TaskRunnerAdapter {

    constructor (taskRunner, taskManager) {
        let contextName = this.constructor.name;

        var _taskRunner,
            _taskManager;

        Object.defineProperties(this, {
            taskRunner: {
                get: function () {
                    return _taskRunner;
                },
                set: function (value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, 'taskRunner', value, Object);
                    _taskRunner = value;
                },
                enumerable: true
            },
            taskManager: {
                get: function () {
                    return _taskManager;
                },
                set: function (value) {
                    sjl.throwTypeErrorIfNotOfType(contextName, 'taskManager', value, sjl.ns.stdlib.Config);
                    _taskManager = value;
                }
            }
        });
        this.taskRunner = taskRunner;
        this.taskManager = taskManager;
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
            out = sjl.extend(out, {taskAlias: taskAlias, bundle: bundle, params: params});
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

    task (taskName, depsOrCallback, callback) {
        return this;
    }

    registerTask (taskName, depsOrCallback, callback) {
        return this.task.apply(this.taskRunner, arguments);
    }

    registerMultiTask (taskName, tasks, deps, taskManager, taskRunner) {
        return this.multiTask.apply(this, arguments);
    }

    multiTask (taskName, tasks, deps, taskManager, taskRunner) {
        return this;
    }

    getTask (key) {
        return {};
    }

    launchTasks (tasks) {
        return Promise.reject(this.constructor.name + '.launchTasks isn\'t impelemented');
    }

    launchTasksSync (tasks) {
        return Promise.reject(this.constructor.name + '.launchTasks isn\'t impelemented');
    }

}

module.exports = TaskRunnerAdapter;
