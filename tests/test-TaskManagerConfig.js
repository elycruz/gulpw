/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let fs = require('fs'),
    chai = require('chai'),
    expect = chai.expect,
    sjl = require('sjljs'),
    TaskManagerConfig = require('../src/TaskManagerConfig'),
    propNames = [
        'bundleConfigsPath',
        'bundleConfigFormats',
        'localConfigPath',
        'localConfigBackupPath',
        'localHelpDocsPath',
        'helpDocsPath',
        'taskConfigs',
        'staticTaskConfigs',
        'configPath'
    ],
    config = {
        'bundleConfigsPath': '',
        'bundleConfigFormats': ['.js', '.json', '.yaml'],
        'localConfigPath': 'gulpw-configs/',
        'localConfigBackupPath': '.gulpw/gulpw-configs',
        'localHelpDocsPath': 'gulpw-help-docs/',
        'helpDocsPath': 'help-docs/',
        'taskConfigs': {someTask: 'hello'},
        'staticTaskConfigs': '',
        'configPath': ''
    };

describe ('TaskManagerConfig', function () {
    it ('Should have default properties "' + propNames.join('", "') + '".', function () {
        var taskManagerConfig = new TaskManagerConfig(config);
        propNames.forEach((prop) => {
            expect(taskManagerConfig[prop]).to.equal(true);
        });
    });
});
