/**
 * Created by ElyDeLaCruz on 10/29/2014.
 */

require('sjljs');

var fs = require('fs'),
    chai = require('chai'),
    expect = chai.expect,
    yaml = require('js-yaml'),
    Bundle = require('../src/Bundle');

describe("#`Bundle`", function () {

    var bundleConfig = yaml.safeLoad(fs.readFileSync('./tests/sample-project/bundle-configs/mvp-bundle.yaml')),
        bundle = new Bundle(bundleConfig);

    it ('Should inherit options passed into the constructor.', function () {
        Object.keys(bundleConfig).forEach(function (key) {
            expect(bundle.options.hasOwnProperty(key)).to.equal(true);
        });
    });

    it('Should have an `options` property.', function () {
        expect(bundle.hasOwnProperty('options')).to.equal(true);
    });

    it('Should have `getOption` and `setOption` methods.', function () {
        expect(sjl.classOf(bundle.getOption)).to.equal('Function');
        expect(sjl.classOf(bundle.setOption)).to.equal('Function');
    });

    it('Should have `setupHasMethods` method.', function () {
        expect(sjl.classOf(bundle.setupHasMethods)).to.equal('Function');
    });

    // Check `has*` methods (methods for each property in bundle yaml `hasName` etc. (methods created by `setupHasMethods`)
    Object.keys(bundleConfig).forEach(function (key) {
        var methodName = sjl.camelCase('has-' + key);
        it('Should have a `' + methodName + '` method.', function () {
            expect(sjl.classOfIs(bundle[methodName], 'Function')).to.equal(true);
        });
    });

});
