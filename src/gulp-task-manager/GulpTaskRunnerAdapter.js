/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let sjl = require('sjljs'),
    TaskRunnerAdapter = require('./../TaskRunnerAdapter');

class GulpTaskRunnerAdapter extends TaskRunnerAdapter {
    constructor (taskRunner) {
        super(taskRunner);
    }

    getTask (key) {
        return this.taskRunner.tasks[key];
    }

    hasTask (key) {
        return sjl.issetAndOfType(this.getTask(key), Object);
    }

    hasCompletedTask (key) {
        var taskObj = this.taskRunner.tasks[key];
        return sjl.issetAndOfType(taskObj, Object) && taskObj.done === true;
    }

    runTask (key) {
        this.taskRunner.start(key);
        return this;
    }

}

module.exports = GulpTaskRunnerAdapter;
