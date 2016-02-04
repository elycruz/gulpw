/**
 * Created by Ely on 12/16/2015.
 */
'use strict';

let chai = require('chai'),
    expect = chai.expect,
    sjl = require('sjljs'),
    Bundle = require('./../../src/Bundle'),
    Config = require('./../../src/Config'),
    propNames = [
        'alias',
        'description',
        'version'
    ];

describe ('Bundle', function () {
    it ('Should be an instanceof `Config` class.', () => {
        expect(new Bundle() instanceof Config).to.equal(true);
    });
    it ('Should have default properties "' + propNames.join('", "') + '".', function () {
        //{alias: 'hello', description: 'hello2', version: '0.0.0'}
        var bundle = new Bundle();
        propNames.forEach((prop) => {
            expect(sjl.issetAndOfType(bundle[prop], String)).to.equal(true);
        });
    });
});
