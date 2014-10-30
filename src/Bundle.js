/**
 * Created by edelacruz on 9/19/2014.
 */

require('sjljs');

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
        self.setupHasMethods(options, true);

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
         * @param levelsLimit {Integer} - Optional, passed automatically when using the `deep` param/option.
         * @param currentLevel {Integer} - Optional, passed automatically when using the `deep` param/option (no need to set this param on initial call).
         */
        setupHasMethods: function (config, deep, levelsLimit, currentLevel, currentLimit) {
            levelsLimit = sjl.isset(levelsLimit) && sjl.classOfIs(levelsLimit, 'Number') ? levelsLimit : 0;
            currentLevel = sjl.isset(currentLimit) && sjl.classOfIs(levelsLimit, 'Number') ? currentLimit + 1 : 0;
            deep = sjl.isset(deep) ? deep : false;

            var self = this;

            // Loop through keys on this bundle
            Object.keys(config).forEach(function (key) {
                var methodName = sjl.camelCase('has-' + key, true);

                // If bundle doesn't have has method, add it
                if (!self.hasOwnProperty(methodName)
                    || !sjl.classOfIs(self[methodName], 'Function')) {

                    // Add has method to bundle
                    self[methodName] = function () {
                        return self.options.hasOwnProperty(key);
                    };

                    // If deep perform recursive setup of has methods
                    if (deep && sjl.classOfIs(config[key], 'Object')
                        && (levelsLimit !== 0 && currentLevel <= levelsLimit)) {
                        self.setupHasMethods(self, config[key], deep,
                            levelsLimit, currentLevel);
                    }
                }

            }); // end of Object.keys(config).forEach

        } // end of setupHasMethods

    }); // end of Bundle

