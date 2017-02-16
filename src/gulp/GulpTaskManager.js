/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let TaskManager = require('../TaskManager'),
    GulpTaskRunnerAdapter = require('./GulpTaskRunnerAdapter'),
    gulp = require('gulp');

class GulpTaskManager extends TaskManager {
    constructor (config) {
        super(config);
        this.taskRunnerAdapter = new GulpTaskRunnerAdapter(gulp, this);
        this.init();
    }

    task (taskName, deps, callback) {
        this.taskRunnerAdapter.task(taskName, deps, callback);
        return this;
    }

    launchTasks (taskCommands) {
        return (
            this.runningInMode === TaskManager.RUNNING_MODE_ASYNC ?
                this.taskRunnerAdapter.launchTasksAsync(taskCommands) :
                    this.taskRunnerAdapter.launchTasksSync(taskCommands)
        ).catch(this.log);
    }

}

module.exports = GulpTaskManager;
