/**
 * Created by Ely on 12/16/2015.
 */
'use strict';

let chai = require('chai'),
    expect = chai.expect,
    sjl = require('sjljs'),
    configMethodNames = [
        'option',
        'options',
        'has'
    ],
    Config = require('../src/Config'),
    nullValuedObject = {
        someNullValue: null,
        someOtherNullValue: null,
        andAThirdNullValue: null
    },
    nonNullValuedObject = {
        stringValue: 'Hello World',
        numberValue: 1234567890,
        booleanValue: false,
        arrayValue: [],
        objectValue: {},
        nullValue: null,
        functionValue: function () {}
    },
    mixedValueObject = Object.assign(nullValuedObject, nonNullValuedObject);

function objectKeyAndValueTypes (obj) {
    var keys = Object.keys(obj),
        out = {};
    keys.forEach((key) => {
        out[key] = sjl.classOf(obj[key]);
    });
    return out;
}

describe ('Config', function () {
    it ('Should have methods "' + configMethodNames.join('", "') + '".', function () {
        var config = new Config();
        configMethodNames.forEach((methodName) => {
            expect(methodName in config).to.equal(true);
            expect(typeof config[methodName]).to.equal('function');
        });
    });

    it ('Should merge all objects passed into it at instantiation time.', function () {
        var someOptionsObj = {
                alias: '',
                version: '',
                description: ''
            },
            config = new Config(someOptionsObj, nullValuedObject, nonNullValuedObject),
            expectedOptionsObj = sjl.extend({}, someOptionsObj, nullValuedObject, nonNullValuedObject),
            expectedKeysAndTypes = objectKeyAndValueTypes(expectedOptionsObj);

        Object.keys(expectedOptionsObj).forEach((prop) => {
            expect(sjl.classOf(config.option(prop))).to.equal(expectedKeysAndTypes[prop]);
        });
    });

    describe ('#`option`', function () {
        it ('Should be able to set a value and return itself after doing so.', function () {
            var value = '99 bottles of beer...',
                valueKey = 'beverages',
                config = new Config(),
                opRetVal = config.option(valueKey, value);
            expect(config.option(valueKey)).to.equal(value);
            expect(opRetVal).to.equal(config);
        });

        it ('Should be able to get a value.', function () {
            var value = '99 bottles of beer...',
                valueKey = 'beverages',
                config = new Config(),
                opRetVal = config
                    .option(valueKey, value)
                    .option(valueKey);
            expect(opRetVal).to.equal(value);
        });
    });

    describe ('#`options`', function () {
        it ('Should be able to set multiple options at once.', function () {
            var config = new Config(),
                opRetVal = config.options(mixedValueObject),
                keysToSet = Object.keys(mixedValueObject);

            keysToSet.forEach((key, index) => {
                expect(config.options()[key]).to.equal(mixedValueObject[key]);
            });

            // Should of returned self
            expect(opRetVal).to.equal(config);
        });

    });

    describe ('#`has`', function () {
        it ('Should return whether a Config instance has an option or not.', function () {
            var config = new Config(),
                keysToSearch = Object.keys(mixedValueObject);
            config.options(mixedValueObject);
            keysToSearch.forEach((key) => {
                var expectedBln = sjl.isset(mixedValueObject[key]);
                expect(config.has(key)).to.equal(expectedBln);
            });
        });

    });

    describe
});
