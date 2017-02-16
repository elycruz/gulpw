/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let path = require('path'),
    fjl = require('fjl'),
    {expectInstanceOf, expectFunction, expectHasOwnProperty} = require('../testUtils'),
    gwUtils = require('./../../src/Utils'),

    // Get configurations for TaskManager
    packageJson = require('./../../package.json'),
    testProjectPath = path.join(__dirname, './../../' + packageJson.testRepoPath),
    testProjectConfigPath = path.join(testProjectPath, '/gulpw-config.yaml'),
    defaultConfig = gwUtils.loadConfigFile('configs/gulpw-config.yaml'),
    userConfig = gwUtils.loadConfigFile(testProjectConfigPath),
    requiredConfig = {
        argv: {_: ['build']},
        configPath: testProjectConfigPath,
        configBase: testProjectPath
    },
    exampleConfig = fjl.assignDeep({}, defaultConfig, requiredConfig, userConfig),

    TaskManagerConfig = require('./../../src/TaskManagerConfig'),
    TaskManager = require('./../../src/TaskManager');

describe('TaskManager', function () {

    describe ('Construction', function () {
        it ('Should be an instanceof `TaskManagerConfig` when called with `new`', function () {
            expectInstanceOf(new TaskManager(), TaskManagerConfig);
            expectInstanceOf(new TaskManager(exampleConfig), TaskManagerConfig);
        });
        it ('Should construct an instance when called with `new` and passing in no configuration', function () {
            expectInstanceOf(new TaskManager(), TaskManagerConfig);
        });
        it ('Should construct an instance when called with `new`  and passing in a configuration', function () {
            expectInstanceOf(new TaskManager(exampleConfig), TaskManagerConfig);
        });
    });

    describe ('Methods', function () {
        describe ('should have the required interface.', function () {
            let taskManager = new TaskManager();
            [
                'init', 'getTaskAdapter', 'getStaticTaskAdapter',
                'isTaskRegistered', 'launchTasks', 'launchTasksAsync',
                'launchTasksSync', 'task', 'log'
            ]
                .forEach(key => expectFunction(taskManager[key]));
        });
    })

});
