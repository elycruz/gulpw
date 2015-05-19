/**
 * Created by edelacruz on 9/19/2014.
 */

'use strict';

require('sjljs');

/**
 * Bundle constructor.
 * @param options {Object} - Required
 * @constructor
 */
module.exports = sjl.Optionable.extend(function Bundle(options) {
        var self = this;

        // merged with our defaults
        sjl.Optionable.apply(self, [{
            alias: 'Alias goes here.',
            description: 'Description goes here.',
            version: 'Semver version string goes here.'
        }, options]);

        // If has init function run it
        if (sjl.isset(self.init) && sjl.classOfIs(self.init, 'Function')) {
            self.init();
        }

    }); // end of Bundle
