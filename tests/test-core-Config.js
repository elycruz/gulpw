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
    Config = require('./../src/Config'),
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
        functionValue: () => {
        },
        someNestedObject: {all: {your: {base: {are: {belong: {to: {us: true}}}}}}}
    },
    mixedValueObject = Object.assign({}, nullValuedObject, nonNullValuedObject);

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

    describe('#`has`', () => {
        it('Should return whether a Config instance has an option or not.', () => {
            var config = new Config(),
                keysToSearch = Object.keys(mixedValueObject);
            sjl.extend(true, config, mixedValueObject);
            keysToSearch.forEach((key) => {
                var expectedBln = sjl.isset(mixedValueObject[key]);
                expect(config.has(key)).to.equal(expectedBln);
            });
        });
    });

    describe('#`JSON.stringify', () => {
        // Not sure how JSON handles classes so putting a test for it here
        it('Ensure that JSON.stringify works as expected on an instance.', () => {
            var config = new Config(mixedValueObject),
                clonedMixedValues = sjl.jsonClone(mixedValueObject),
                clonedConfig = sjl.jsonClone(config), //.toJSON(),
                keysToSearch = Object.keys(clonedConfig);
            debugger;
            keysToSearch.forEach((key) => {
                expect(sjl.classOf(clonedConfig[key]))
                    .to.equal(sjl.classOf(clonedMixedValues[key]));
            });
        });
    });

});
