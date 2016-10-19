/**
 * Created by elydelacruz on 10/18/16.
 */


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
            },
        });
    }

    get (bundleName) {
        if (this.has(bundleName)) {
            return Promise.resolve(super.get(bundleName));
        }

        return this.hasPathForBundle(bundleName)
        .then(bundlePath => {
            return this.getBundleFromPath(bundlePath);
        })
        .catch(error => {

        });
    }

    set (bundleName) {
        super.set(bundleName);
        return this;
    }

    hasPathForBundle (bundleName) {
        return gwUtils.pathExists(this.bundlePath(bundleName));
    }

    bundleNameToBundlePath (bundleName) {
        return path.join(this.bundlesPath, bundleName);
    }

    getBundleFromPath (filePath) {
        return gwUtils.loadConfigFile(filePath);
    }

}
