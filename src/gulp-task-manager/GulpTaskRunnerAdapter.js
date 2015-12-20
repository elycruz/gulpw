/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let sjl = require('sjljs'),
    TaskRunnerAdapter = require('././TaskRunnerAdapter');

class GulpTaskRunnerAdapter extends TaskRunnerAdapter {
    constructor (taskRunner) {
        super(taskRunner);
    }

    hasTask (key) {
        return sjl.issetAndOfType(this.taskRunner.tasks[key], Object);
    }

    hasCompletedTask (key) {
        var taskObj = this.taskRunner.tasks[key];
        return sjl.issetAndOfType(taskObj, Object) && taskObj.done === true;
    }

    runTask (key) {
        return this.taskRunner.start(key);
    }

}

module.exports = GulpTaskRunnerAdapter;
