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
        this.taskRunnerAdapter.launchTasks(taskCommands).catch(this.log);
        return this;
    }

    launchTasksSync (/*taskCommands*/) {
        this.taskRunnerAdapter.launchTasksSync();
        return this;
    }
}

module.exports = GulpTaskManager;
