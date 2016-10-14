/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let chai = require('chai'),
    expect = chai.expect,
    sjl = require('sjljs'),
    TaskManagerConfig = require('./../../src/TaskManagerConfig'),
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
    };

describe('TaskManagerConfig', function () {

    describe ('Construction', function () {
        it ('Should be an instanceof `sjl.stdlib.Config`.', function () {
            expect(new TaskManagerConfig()).to.be.instanceof(sjl.stdlib.Config);
        });
    });


    describe ('Properties', function () {
        let SjlMap = sjl.stdlib.SjlMap,
            propertyAndTypeMap = {
                bundleConfigsPath: String,
                bundleConfigFormats: sjl.stdlib.SjlSet,
                localConfigPath: String,
                localConfigBackupPath: String,
                localHelpDocsPath: String,
                helpDocsPath: String,
                taskConfigs: SjlMap,
                staticTaskConfigs: SjlMap,
            },
            taskManagerConfig = new TaskManagerConfig();

        sjl.forEach(propertyAndTypeMap, (Type, key) => {
            describe ('#' + key, function () {
                it ('should have a default value of type "' + Type.name + '".', function () {
                    expect(sjl.issetAndOfType(taskManagerConfig[key], Type)).to.equal(true);
                });
            });
        });
    });

});
