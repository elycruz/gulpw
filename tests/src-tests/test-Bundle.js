/**
 * Created by Ely on 12/16/2015.
 */
'use strict';

let chai = require('chai'),
    expect = chai.expect,
    sjl = require('sjljs'),
    Bundle = require('./../../src/Bundle'),
    Config = sjl.stdlib.Config;

describe ('Bundle', function () {
    describe ('Construction', function () {
        it ('Should be an instanceof `Config`.', () => {
            expect(new Bundle()).to.be.instanceof(Config);
        });
    });
    describe ('Properties', function () {
        let propertyAndTypeMap = {
                alias: String,
                description: String,
                version: String
            },
            bundle = new Bundle();

        sjl.forEach(propertyAndTypeMap, (Type, key) => {
            describe ('#' + key, function () {
                it ('should have a default value of type "' + Type.name + '".', function () {
                    expect(sjl.issetAndOfType(bundle[key], Type)).to.equal(true);
                });
            });
        });
    });
});
