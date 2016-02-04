/**
 * Created by Ely on 12/16/2015.
 */
'use strict';

let chai = require('chai'),
    expect = chai.expect,
    sjl = require('sjljs'),
    configMethodNames = [
        'has'
    ],
    Config = require('./../../src/Config'),
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
        functionValue: () => {},
        someNestedObject: {all: {your: {base: {are: {belong: {to: {us: true}}}}}}}
    },
    mixedValueObject = sjl.extend(true, {}, nullValuedObject, nonNullValuedObject);

function objectKeyAndValueTypes(obj) {
    var keys = Object.keys(obj),
        out = {};
    keys.forEach((key) => {
        out[key] = sjl.classOf(obj[key]);
    });
    return out;
}

describe('Config', () => {

    it('Should have methods "' + configMethodNames.join('", "') + '".', () => {
        var config = new Config();
        configMethodNames.forEach((methodName) => {
            expect(methodName in config).to.equal(true);
            expect(typeof config[methodName]).to.equal('function');
        });
    });

    it('Should merge all objects passed into it at instantiation time.', () => {
        var someOptionsObj = {
                alias: '',
                version: '',
                description: ''
            },
            config = new Config(someOptionsObj, nullValuedObject, nonNullValuedObject),
            expectedOptionsObj = sjl.extend({}, someOptionsObj, nullValuedObject, nonNullValuedObject),
            expectedKeysAndTypes = objectKeyAndValueTypes(expectedOptionsObj);

        Object.keys(expectedOptionsObj).forEach((prop) => {
            expect(sjl.classOf(config[prop])).to.equal(expectedKeysAndTypes[prop]);
        });
    });

    describe('#`get`', () => {
        it ('should be able to get a value by key.', () => {
            var testData = sjl.clone(nonNullValuedObject),
                config = new Config(testData);
            expect(config.get('stringValue')).to.equal(config.stringValue);
            expect(config.get('stringValue')).to.equal(testData.stringValue);
        });
        it ('should be able to get nested values by namespace key.', () => {
            var testData = sjl.clone(nonNullValuedObject.someNestedObject),
                config = new Config(testData);
            expect(config.get('all.your.base.are.belong').to.us).to.equal(config.all.your.base.are.belong.to.us);
            expect(config.get('all.your.base.are.belong').to.us).to.equal(testData.all.your.base.are.belong.to.us);
        });
        it ('should return it\'s owner if no key value is passed in.', () => {
            var testData = sjl.clone(nonNullValuedObject),
                config = new Config(testData);
            expect(config.get()).to.equal(config);
        });
    });

    describe('#`set`', () => {
        it ('should be able to set a value by key and return itself after doing so.', () => {
            var testData = sjl.clone(nonNullValuedObject),
                config = new Config(testData),
                resultOfGetCall = config.set('nullValue', 999);
            expect(config.nullValue).to.equal(999);
            expect(resultOfGetCall).to.equal(config);
        });
        it ('should be able to set a value by namespace key.', () => {
            var testData = sjl.clone(nonNullValuedObject.someNestedObject),
                config = new Config(testData),
                resultOfSetCall = config.set('all.your.base.are.belong.to.us', 'helloworld');
            expect(config.all.your.base.are.belong.to.us).to.equal('helloworld');
            expect(resultOfSetCall).to.equal(config);
        });
        it ('should be able to set multiple values by object hash.', () => {
            var testData = sjl.clone(mixedValueObject),
                testDataKeys = Object.keys(testData),
                config = new Config(),
                resultOfSetCall = config.set(testData);
            expect(config.has('someNestedObject.all.your.base.are.belong.to.us')).to.equal(true);
            expect(resultOfSetCall).to.equal(config);
            testDataKeys.forEach((key) => {
                expect(sjl.classOf(config[key])).to.equal(sjl.classOf(testData[key]));
            });
        });
    });

    describe('#`has`', () => {
        it('Should return whether a Config instance has an option or not.', () => {
            var config = new Config(),
                keysToSearch = Object.keys(mixedValueObject);
            sjl.extend(true, config, sjl.clone(mixedValueObject));
            keysToSearch.forEach((key) => {
                var expectedBln = sjl.isset(mixedValueObject[key]);
                expect(config.has(key)).to.equal(expectedBln);
            });
        });
    });

    describe('#`JSON.stringify', () => {
        // Not sure how JSON handles classes so putting a test for it here
        it('Ensure that JSON.stringify works as expected on an instance.', () => {
            var clonedMixedValues = sjl.clone(mixedValueObject),
                config = new Config(clonedMixedValues),
                clonedConfig = config.toJSON(), //.toJSON(),
                keysToSearch = Object.keys(clonedConfig);
            keysToSearch.forEach((key) => {
                expect(sjl.classOf(clonedConfig[key]))
                    .to.equal(sjl.classOf(clonedMixedValues[key]));
            });
        });
    });

});
