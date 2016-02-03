/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let sjl = require('sjljs'),
    gulp = require('gulp'),
    TaskRunnerAdapter = require('./../TaskRunnerAdapter');

class GulpTaskRunnerAdapter extends TaskRunnerAdapter {
    constructor (taskRunner) {
        super(taskRunner || gulp);
    }

    getTask (key) {
        return this.taskRunner.tasks[key];
    }

    hasTask (key) {
        return sjl.issetAndOfType(this.getTask(key), Object);
    }

    hasCompletedTask (key) {
        var taskRunnerHasTask = sjl.issetAndOfType(this.taskRunner.tasks[key], Object),
            taskObj = taskRunnerHasTask ? this.taskRunner.tasks[key] : null;
        return taskObj && taskObj.done === true;
    }

    runTask (key) {
        this.taskRunner.start(key);
        return this;
    }

}

module.exports = GulpTaskRunnerAdapter;
