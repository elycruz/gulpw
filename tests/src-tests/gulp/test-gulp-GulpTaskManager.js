/**
 * Created by elydelacruz on 2/3/16.
 */

'use strict';

let chai = require('chai'),
    expect = chai.expect,
    path = require('path'),
    gulp = require('gulp'),
    ns = require('../../../src/namespace'),
//sjl = require('sjljs'),

// To get test project path
    packageJson = require('./../../../package.json'),
    gwUtils = ns.Utils,

// Get configurations for TaskManager
    testProjectPath = path.join(__dirname, './../../../' + packageJson.testRepoPath),
    testProjectConfigPath = path.join(testProjectPath, '/gulpw-config.yaml'),
    defaultConfig = gwUtils.loadConfigFile('configs/gulpw-config.yaml'),
    userConfig = gwUtils.loadConfigFile(testProjectConfigPath),
    requiredConfig = {
        argv: {_: ['build']},
        configPath: testProjectConfigPath,
        configBase: testProjectPath
    },
    TaskManager = ns.TaskManager,
    GulpTaskManager = ns.gulp.GulpTaskManager;

describe('GulpTaskManager', () => {

    it ('Should be an instanceof `TaskManager` class should be pass construction' +
        ' with qualifying configuration.', () => {
        let config = sjl.extend(true, {}, defaultConfig, requiredConfig, userConfig);
        expect((new GulpTaskManager(config)) instanceof TaskManager).to.equal(true);
    });

});
