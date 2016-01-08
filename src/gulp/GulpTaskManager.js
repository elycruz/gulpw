/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let TaskManager = require('./../TaskManager');

class GulpTaskManager extends TaskManager {
    constructor (config) {
        super(config);
    }

    launchTasks (taskCommands) {
        return this;
    }

    launchTasksSync (taskCommands) {
        return this;
    }
}

module.exports = GulpTaskManager;
