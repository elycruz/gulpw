/**
 * Created by edelacruz on 9/19/2014.
 */
require('sjljs');

// @todo These are hard coded here temporarily.  They need to be coming from main config or other config file
var hasMethodKeys = {
    clean: null,
    compass: null,
    requirejs: null,
    browserify: null
};

/**
 * Bundle constructor.
 * @param options {Object} - Required
 * @constructor
 */
module.exports = sjl.Optionable.extend(function Bundle(options) {
        var self = this;

        // Call optionable and set the options from the config file
        // merged with our defaults
        sjl.Optionable.call(self, sjl.extend(true, {
            name: "Name goes here.",
            description: "Description goes here.",
            version: "Semver version string goes here."
        }, options));

        // Set up "has*" methods
        self.setupHasMethods(sjl.extend(true, hasMethodKeys, options), true);

        // If has init function run it
        if (self.hasOwnProperty('init') && sjl.classOfIs(self.init, 'Function')) {
            self.init();
        }

    }, {

        /**
         * Creates has methods on bundle from the keys within the `config` object passed in.
         * Adds methods for all keys in object recursively if the `deep` param is true.
         * @param config {Object} - Config object to create has methods from.
         * @param deep {Boolean} - Optional, whether to recursively create has methods on bundle.
         * @param levelsLimit {Integer} - Optional, default `5`
         * @param currentLevel {Integer} - Auto (for internal use only).
         * @param propChainString {String} - Auto (for internal use only).
         * @param lastMethodName {String} - Auto (for internal use only).
         */
        setupHasMethods: function (config, deep, levelsLimit, currentLevel, propChainString, lastMethodName) {
            levelsLimit = sjl.isset(levelsLimit) && sjl.classOfIs(levelsLimit, 'Number') ? levelsLimit : 5;
            currentLevel = sjl.isset(currentLevel) && sjl.classOfIs(currentLevel, 'Number') ? currentLevel + 1 : 0;
            propChainString = propChainString ? propChainString : '';
            deep = sjl.isset(deep) ? deep : false;

            var self = this;

            // Loop through keys on this bundle
            Object.keys(config).forEach(function (key) {
                var methodName = sjl.camelCase('has-' + key),
                    allowedDeeperTraversal = currentLevel > 0 && currentLevel <= levelsLimit,
                    changedPropChain = !sjl.empty(propChainString) ? propChainString + '.' + key : key;

                // If bundle doesn't have has method, add it
                if (!self.hasOwnProperty(methodName) || !sjl.classOfIs(self[methodName], 'Function')) {

                    if (allowedDeeperTraversal) {
                        methodName = lastMethodName + sjl.ucaseFirst(key);
                    }

                    // Add has method to bundle
                    self[methodName] = function () {
                        return !sjl.empty(sjl.namespace(changedPropChain, self.options));
                    };

                    // If deep perform recursive setup of has methods
                    if (deep && sjl.classOfIs(config[key], 'Object') && currentLevel <= levelsLimit) {
                        lastMethodName = methodName;
                        propChainString = changedPropChain;
                        self.setupHasMethods(config[key], deep, levelsLimit, currentLevel, propChainString, lastMethodName);
                    }
                }

            }); // end of Object.keys(config).forEach

        }, // end of setupHasMethods

        hasFiles: function () {
            return !sjl.empty(this.options.files);
        },

        hasFilesJs: function () {
            return !sjl.empty(this.options.files.js);
        },

        hasFilesCss: function () {
            return !sjl.empty(this.options.files.js);
        },

        hasWatch: function () {
            return !sjl.empty(this.options.watch);
        }

    }); // end of Bundle

