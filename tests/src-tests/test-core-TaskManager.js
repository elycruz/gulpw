/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let chai = require('chai'),
    expect = chai.expect,
    path = require('path'),
    gulp = require('gulp'),
    //sjl = require('sjljs'),

    // To get test project path
    packageJson = require('./../../package.json'),
    gwUtils = require('./../../src/Utils'),

    // Get configurations for TaskManager
    testProjectPath = path.join(__dirname, './../../' + packageJson.testRepoPath),
    testProjectConfigPath = path.join(testProjectPath, '/gulpw-config.yaml'),
    defaultConfig = gwUtils.loadConfigFile('configs/gulpw-config.yaml'),
    userConfig = gwUtils.loadConfigFile(testProjectConfigPath),
    requiredConfig = {
        argv: {_: ['build']},
        configPath: testProjectConfigPath,
        configBase: testProjectPath
    },
    TaskManagerConfig = require('./../../src/TaskManagerConfig'),
    TaskManager = require('./../../src/TaskManager');

describe('TaskManager', () => {

    it ('Should be an instanceof `TaskManagerConfig` class should be pass construction' +
        ' with qualifying configuration.', () => {
        let config = sjl.extend(true, {}, defaultConfig, requiredConfig, userConfig);
        expect((new TaskManager(config)) instanceof TaskManagerConfig).to.equal(true);
    });

});
