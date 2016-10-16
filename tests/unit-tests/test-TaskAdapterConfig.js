/**
 * Created by Ely on 7/3/2016.
 */

'use strict';

let chai = require('chai'),
    expect = chai.expect,
    sjl = require('sjljs'),
    TaskAdapterConfig = require('./../../src/TaskAdapterConfig');

describe('TaskAdapterConfig', function () {

    describe ('Properties', function () {
        let propertyAndTypeMap = {
            alias: String,
            priority: Number,
            alternateTaskName: String,
            constructorLocation: String,
            configurableModules: Array
        },
            taskAdapterConfig = new TaskAdapterConfig();

        sjl.forEach(propertyAndTypeMap, (Type, key) => {
            describe ('#' + key, function () {
                it ('should have a default value of type "' + Type.name + '".', function () {
                    expect(sjl.issetAndOfType(taskAdapterConfig[key], Type)).to.equal(true);
                });
            });
        });
    });

});
