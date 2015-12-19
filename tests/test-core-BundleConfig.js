/**
 * Created by Ely on 12/16/2015.
 */
'use strict';

let chai = require('chai'),
    expect = chai.expect,
    sjl = require('sjljs'),
    BundleConfig = require('./BundleConfig'),
    propNames = [
        'alias',
        'description',
        'version'
    ];

describe ('BundleConfig', function () {
    it ('Should have default properties "' + propNames.join('", "') + '".', function () {
        //{alias: 'hello', description: 'hello2', version: '0.0.0'}
        var bundle = new BundleConfig();
        propNames.forEach((prop) => {
            expect(sjl.issetAndOfType(bundle[prop], String)).to.equal(true);
        });
    });
});
