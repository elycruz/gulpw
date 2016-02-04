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

    getTask(key) {
        return this.taskRunner.tasks[key];
    }

    hasTask(key) {
        return sjl.issetAndOfType(this.getTask(key), Object);
    }

    hasCompletedTask(key) {
        var taskObj = this.getTask(key);
        return taskObj && taskObj.done === true;
    }

    runTask(key) {
        this.taskRunner.start(key);
        return this;
    }

    setTask(taskName, depsOrFunc, func) {
        this.taskRunner.task(taskName, depsOrFunc, func);
        return this;
    }

    setMultiTask(taskName, tasks, deps, taskManager, taskRunner) {
        let self = this;
        taskManager = taskManager || self.taskManager;
        taskRunner = taskRunner || self.taskRunner;
        if (deps) {
            taskRunner.task(taskName, deps, function () {
                var method = !taskManager.argv.async ? 'launchTasksSync' : 'launchTasks';
                return self[method](tasks, taskRunner);
            });
        }
        else {
            taskRunner.task(taskName, function () {
                var method = !taskManager.argv.async ? 'launchTasksSync' : 'launchTasks';
                return self[method](tasks, taskRunner);
            });
        }
        return self;
    }

    launchTasks(tasks) {
        var self = this,
            taskManager = self.taskManager,
            taskRunner = self.taskRunner;

        //self.log('gulp tasks: \n', nodeUtils.inspect(gulp.tasks, {depth: 10}), '--debug');

        if (sjl.empty(tasks)) {
            taskManager.log('No tasks to run found.');
            return Promise.reject('`Wrangler.prototype.launchTasks` recieved an empty tasks list.');
        }

        // Ensure only registered tasks get run
        tasks = self._onlyRegisteredTasks(tasks, self);

        // Return a promise that will fulfill when all tasks are finished
        return new Promise(function (fulfill, reject) {
            var intervalSpeed = 100,
                completedTasks,
                completionInterval = null;

            // Kick off each task
            self._runTasks(tasks, fulfill, reject, self);

            completionInterval = setInterval(function () {
                completedTasks = tasks.filter(function (key) {
                    return sjl.isset(taskRunner.tasks[key]) && taskRunner.tasks[key].done && taskRunner.tasks[key].done === true;
                });

                if (completedTasks.length === tasks.length) {
                    fulfill();
                    //taskList = tasks.map(function (key) { return '\n - `' + key + '`'; }).join('');
                    clearInterval(completionInterval);
                }

            }, intervalSpeed);

        }); // end of promise
    }

    _onlyRegisteredTasks (tasks, self) {
        return tasks.filter(function (task) {
            var retVal;
            if (self.isTaskRegistered(task)) {
                retVal = true;
            }
            else {
                self.log(chalk.yellow(' ! Could not run the task "' + task + '".  Task not defined.'));
                retVal = false;
            }
            return retVal;
        });
    }

    _runTasks (tasks, fulfill, reject, self) {
        // Start each task
        tasks.forEach(function (item) {
            // Run task
            try {
                self.log(chalk.grey('- Launching gulp task "' + item + '".'), '--debug');
                self.runTask(item);
            }
            catch (e) {
                self.log(chalk.red('`Wrangler.launchTasks` encountered the following error:\n'),
                    chalk.grey(e.message), chalk.grey(e.lineNumber), chalk.grey(e.stack));
                reject('`Wrangler.launchTasks` encountered the following error:' + e);
            }
        });
        return self;
    }

}

module.exports = GulpTaskRunnerAdapter;
