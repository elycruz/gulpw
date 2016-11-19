/**
 * Created by elydelacruz on 2/3/16.
 */

'use strict';

let chai = require('chai'),
    //expect = chai.expect,
    path = require('path'),
    gulp = require('gulp'),
    root = './../../../',
    sjl = require('sjljs'),

    // To get test project path
    packageJson = require(root + 'package.json'),
    gwUtils = require(root + 'src/Utils'),

    // Get configurations for TaskManager
    testProjectPath = path.join(__dirname, root, packageJson.testRepoPath),
    testProjectConfigPath = path.join(testProjectPath, '/gulpw-config.yaml'),
    // defaultConfig = gwUtils.loadConfigFile('configs/gulpw-config.yaml'),
    // userConfig = gwUtils.loadConfigFile(testProjectConfigPath),
    // requiredConfig = {
    //     argv: {_: ['build']},
    //     configPath: testProjectConfigPath,
    //     configBase: testProjectPath
    // },
    TaskManager = require(root + 'src/TaskManager'),
    GulpTaskManager = require(root + 'src/gulp/GulpTaskManager');

describe('GulpTaskManager', () => {

    // it ('Should be an instanceof `TaskManager`.', () => {
    //     let config = sjl.extend(true, {}, defaultConfig, requiredConfig, userConfig);
    //     expect((new GulpTaskManager(config)) instanceof TaskManager).to.equal(true);
    // });

});
