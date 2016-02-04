/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let TaskManager = require('./../TaskManager'),
    GulpTaskRunnerAdapter = require('./GulpTaskRunnerAdapter'),
    gulp = require('gulp');

class GulpTaskManager extends TaskManager {
    constructor (config) {
        super(config);
        this.taskRunnerAdapter = new GulpTaskRunnerAdapter(gulp);
        this.init();
    }

    launchTasks (taskCommands) {
        return this;
    }

    launchTasksSync (taskCommands) {
        return this;
    }
}

module.exports = GulpTaskManager;
