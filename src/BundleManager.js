/**
 * Created by elydelacruz on 10/18/16.
 */

'use strict';

let sjl = require('sjl'),
    gwUtils = require('./Utils'),
    path = require('path'),
    Bundle = require('./Bundle'),
    contextName = 'gulpw.BundleManager';

class BundleManager extends Map {

    constructor () {
        var _bundlesPath,
            _bundleConfigFormats;
        Object.defineProperties(this, {
            bundleConstructor: {
                value: Bundle,
                enumerable: true,
                writable: true
            },
            bundleConfigFormats: {
                get: function () {
                    return _bundleConfigFormats;
                },
                set: function (value) {
                    sjl.throwTypeErrorIfEmpty(contextName, 'bundleConfigFormats', value, Array);
                    _bundleConfigFormats = value;
                },
                enumerable: true
            },
            bundlesPath: {
                get: function () {
                    return _bundlesPath;
                },
                set: function (value) {
                    sjl.throwTypeErrorIfEmpty(contextName, 'bundlesPath', value, String);
                    _bundlesPath = value;
                },
                enumerable: true
            }
        });
    }

    get (bundleName) {
        if (this.has(bundleName)) {
            return Promise.resolve(super.get(bundleName));
        }

        return this._hasPathForBundle(bundleName)
        .then(bundlePath => {
            return this._getBundleFromPath(bundlePath);
        })
        .catch(console.log);
    }

    set (bundleName, value) {
        super.set(bundleName, value);
        return this;
    }

    _hasPathForBundle (bundleName) {
        return gwUtils.isPathReadable(this._bundleNameToBundlePath(bundleName));
    }

    _bundleNameToBundlePath (bundleName) {
        return path.join(this.bundlesPath, bundleName);
    }

    _getBundleFromPath (filePath) {
        return gwUtils.loadConfigFile(filePath);
    }

}

module.exports = BundleManager;
