/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let chai = require('chai'),
    expect = chai.expect,
    //sjl = require('sjljs'),
    gwUtils = require('./../src/Utils'),
    defaultConfig = gwUtils.loadConfigFile('./configs/gulpw-config.yaml'),
    TaskManagerConfig = require('./../src/TaskManagerConfig'),
    TaskManager = require('./../src/TaskManager'),
    config = {
        bundleConfigsPath: './some-bundles/config-path/',
        bundleConfigFormats: ['.js', '.json', '.yaml'],
        localConfigPath: 'gulpw-configs/',
        localConfigBackupPath: '.gulpw/gulpw-configs',
        localHelpDocsPath: 'gulpw-help-docs/',
        helpDocsPath: 'help-docs/',
        taskConfigs: {someTask: 'hello'},
        staticTaskConfigs: {someStaticTaskConfig: {someKeyValuePair: 'some value'}},
        configPath: './configs/gulpw-config.yaml',
        configBase: './configs'
    },
    propNames = Object.keys(config);

describe('TaskManager', () => {
    it ('Should be an instanceof `TaskManagerConfig` class.', () => {
        expect(new TaskManager(defaultConfig, {}) instanceof TaskManagerConfig).to.equal(true);
    });

    var joinedPropNames = propNames.join('", "');
    //
    //it('Should have a default value for "' + joinedPropNames + '".', () => {
    //    var taskManager = new TaskManager(config);
    //    propNames.forEach((prop) => {
    //        expect(taskManager.has(prop)).to.equal(true);
    //    });
    //});
    //
    //it('Should be able to use property overloaded methods to get and set property values "' + joinedPropNames + '".', () => {
    //    var taskManager = new TaskManager(config);
    //    propNames.forEach((prop) => {
    //        expect(taskManager.has(prop)).to.equal(true);
    //    });
    //});

});
