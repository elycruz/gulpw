/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let TaskManager = require('./../task-manager/TaskManager');

class GulpTaskManager extends TaskManager {
    constructor (taskRunner, argv, env, config) {
        super(taskRunner, argv, env, config);
    }
}

module.exports = GulpTaskManager;
