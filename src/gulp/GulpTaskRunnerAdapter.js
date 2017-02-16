/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let sjl = require('sjljs'),
    gulp = require('gulp'),
    chalk = require('chalk'),
    TaskRunnerAdapter = require('../TaskRunnerAdapter');

class GulpTaskRunnerAdapter extends TaskRunnerAdapter {

    constructor (taskRunner, taskManager) {
        super(taskRunner, taskManager);
    }

    getTask(key) {
        return this.taskRunner.tasks[key];
    }

    hasTask(key) {
        return sjl.issetAndOfType(this.getTask(key), Object);
    }

    hasCompletedTask(key) {
        let taskObj = this.getTask(key);
        return taskObj && taskObj.done && taskObj.done === true;
    }

    runTask(key) {
        this.taskRunner.start(key);
        return this;
    }

    task (taskName, depsOrCallback, callback) {
        this.taskRunner.task.apply(this.taskRunner, arguments);
        return this;
    }

    multiTask (taskName, tasks, deps, taskManager, taskRunner) {
        let multiTaskCallback  = () => {
                let method = !taskManager.argv.async ? 'launchTasksSync' : 'launchTasks';
                return this[method](tasks, taskRunner);
            };
        taskManager = taskManager || this.taskManager;
        taskRunner = taskRunner || this.taskRunner;
        return deps ?
            this.task(taskName, deps, multiTaskCallback) :
            this.task(taskName, multiTaskCallback);
    }

    launchTasks (tasks) {
        let self = this,
            taskManager = self.taskManager,
            knownTasksAndUnknownTasks;

        //taskManager.log('gulp tasks: \n', nodeUtils.inspect(gulp.tasks, {depth: 10}), '--debug');

        if (sjl.empty(tasks)) {
            taskManager.log('No tasks to run found.');
            return Promise.reject('`TaskManager.prototype.launchTasks` recieved an empty tasks list.');
        }

        // Get knowns and unknowns
        knownTasksAndUnknownTasks = self._getKnownAndUnknownTasks(tasks);

        // Ensure only registered tasks get run
        let {knownTasks, unknownTasks} = knownTasksAndUnknownTasks;

        // Warn about any tasks that we don't know how to run
        this._warnAboutUnknownTasks(unknownTasks);

        // Return a promise that will fulfill when all tasks are finished
        return new Promise( (fulfill, reject) => {
            let intervalSpeed = 100;
            let completedTasks,
                completionInterval = null;

            // Kick off each task
            this._runTasks(knownTasks, fulfill, reject);

            // Wait for all tasks to complete before calling `fulfill`
            completionInterval = setInterval(function () {
                completedTasks = knownTasks.filter(key => self.hasCompletedTask(key));
                if (completedTasks.length === knownTasks.length) {
                    fulfill();
                    //taskList = tasks.map(function (key) { return '\n - `' + key + '`'; }).join('');
                    clearInterval(completionInterval);
                }
            }, intervalSpeed);

        })
            .catch(taskManager.log);
    }

    launchTasksAsync (tasks) {

    }

    launchTasksSync (tasks) {
        return Promise.resolve(true);
    }

    _getKnownAndUnknownTasks (tasks) {
        return {
            knownTasks: tasks.filter(task => this.hasTask(task)),
            unknownTasks: tasks.filter(task => !this.hasTask(task))
        };
    }

    _warnAboutUnknownTasks (unknownTasks) {
        unknownTasks.forEach(task => {
            this.taskManager.log(chalk.yellow(' ! Could not run the task "' + task + '".  Task not defined.'));
        });
    }

    _runTasks (tasks, fulfill, reject) {
        tasks.forEach(item => {
            try {
                // Log 'launching task'
                this.taskManager.log(chalk.grey('- Launching gulp task "' + item + '".'), '--debug');
                // Try to run task
                this.runTask(item);
            }
            catch (e) {
                // Log error occurred
                this.taskManager.log(chalk.red('`TaskManager.launchTasks` encountered the following error:\n'),
                    chalk.grey(e.message), chalk.grey(e.lineNumber), chalk.grey(e.stack));
                // Reject promise
                reject('`TaskManager.launchTasks` encountered the following error:' + e);
            }
        });
        return this;
    }

}

module.exports = GulpTaskRunnerAdapter;
