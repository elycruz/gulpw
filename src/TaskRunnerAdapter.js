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

    //hasTask (key) {
    //}
    //
    //hasCompletedTask (key) {
    //}
    //
    //runTask (key) {
    //}
    //
    //registerTask (taskKey) {
    //}
    //
    //getTask (key) {
    //}
    //
    //setTask (key) {
    //}

}

module.exports = TaskRunnerAdapter;
