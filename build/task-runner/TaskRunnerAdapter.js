/**
 * Created by Ely on 12/18/2015.
 */
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var sjl = require('sjljs'),
    contextName = 'TaskRunnerAdapter';

var TaskRunnerAdapter = function TaskRunnerAdapter(taskRunner) {
    _classCallCheck(this, TaskRunnerAdapter);

    var _taskRunner = {};
    Object.defineProperty(this, 'taskRunner', {
        get: function get() {
            return _taskRunner;
        },
        set: function set(value) {
            sjl.throwTypeErrorIfNotOfType(contextName, 'taskRunner', value, Object);
            _taskRunner = value;
        },
        writable: true,
        enumerable: true
    });
    this.taskRunner = taskRunner;
}

//hasTask (key) {
//}
//
//hasCompletedTask (key) {
//}
//
//runTask (key) {
//}
//
//registerTask (taskKey) {
//}
//
//getTask (key) {
//}
//
//setTask (key) {
//}

;

module.exports = TaskRunnerAdapter;