/**
 * Created by ElyDeLaCruz on 10/29/2014.
 */

require('sjljs');
require('var_dumpjs');

var fs = require('fs'),
    chai = require('chai'),
    expect = chai.expect,
    yaml = require('js-yaml'),
    GulpBundleWrangler = require('../src/GulpBundleWrangler'),
    Bundle = require('../src/Bundle'),
    TaskProxy = require('../src/TaskProxy');

describe("Bundle", function () {

    var bundleConfig = yaml.safeLoad(fs.readFileSync('./tests/mvp-bundle.yaml')),
        bundle = new Bundle(bundleConfig);

    it('Should inherit `options`.', function () {
        expect(bundle.getOption('description') === bundleConfig.description).to.equal(true);
    });

    it('Should have `has*` methods for all keys passed into options.', function () {
        expect(sjl.classOfIs(bundle.hasName, 'Function')).to.equal(true);
    });

});

//describe("TaskProxy", function () {
//    it('Should have more tests written');
//});
//
//describe("GulpBundleWrangler", function () {
//    it('Should have more tests written');
//});
