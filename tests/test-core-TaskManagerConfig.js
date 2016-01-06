/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let chai = require('chai'),
    expect = chai.expect,
    //sjl = require('sjljs'),
    Config = require('./../src/Config'),
    TaskManagerConfig = require('./../src/TaskManagerConfig'),
    config = {
        bundleConfigsPath: './some-bundles/config-path',
        bundleConfigFormats: ['.js', '.json', '.yaml'],
        localConfigPath: 'gulpw-configs/',
        localConfigBackupPath: '.gulpw/gulpw-configs',
        localHelpDocsPath: 'gulpw-help-docs/',
        helpDocsPath: 'help-docs/',
        taskConfigs: {someTask: 'hello'},
        staticTaskConfigs: {someStaticTaskConfig: {someKeyValuePair: 'some value'}},
        configPath: './some/config/path'
    },
    propNames = Object.keys(config);

describe('TaskManagerConfig', () => {
    it ('Should be an instanceof `Config` class.', () => {
        expect(new TaskManagerConfig() instanceof Config).to.equal(true);
    });

    var joinedPropNames = propNames.join('", "');

    it('Should have a default value for "' + joinedPropNames + '".', () => {
        var taskManagerConfig = new TaskManagerConfig(config);
        propNames.forEach((prop) => {
            expect(taskManagerConfig.has(prop)).to.equal(true);
        });
    });

    it('Should be able to use property overloaded methods to get and set property values "' + joinedPropNames + '".', () => {
        var taskManagerConfig = new TaskManagerConfig(config);
        propNames.forEach((prop) => {
            expect(taskManagerConfig.has(prop)).to.equal(true);
        });
    });

});
