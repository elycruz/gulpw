/**
 * Created by Ely on 12/16/2015.
 */
'use strict';

let chai = require('chai'),
    expect = chai.expect,
    sjl = require('sjljs'),
    BundleConfig = require('../src/BundleConfig'),
    propNames = [
        'alias',
        'description',
        'version'
    ];

describe ('BundleConfig', function () {
    it ('Should have default properties "' + propNames.join('", "') + '".', function () {
        var bundle = new BundleConfig();
        propNames.forEach((prop) => {
            expect(sjl.issetAndOfType(bundle.option(prop), String)).to.equal(true);
        });
    });
});
