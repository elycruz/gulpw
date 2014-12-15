/**
 * Created by edelacruz on 9/19/2014.
 */
"use strict"; require("sjljs");

/**
 * Bundle constructor.
 * @param options {Object} - Required
 * @constructor
 */
module.exports = sjl.Optionable.extend(function Bundle(options) {
        var self = this;

        // Call optionable and set the options from the config file
        // merged with our defaults
        this.options = options;
        //sjl.Optionable.call(self, sjl.extend(true, {
        //    name: "Name goes here.",
        //    description: "Description goes here.",
        //    version: "Semver version string goes here."
        //}, options));

        // If has init function run it
        if (self.hasOwnProperty('init') && sjl.classOfIs(self.init, 'Function')) {
            self.init();
        }

    }, {

        has: function (nsString) {
            var parts = nsString.split('.'),
                i, nsStr, retVal = false;

            if (parts.length > 1) {
                nsStr = parts.shift();
                for (i = 0; i <= parts.length; i += 1) {
                    retVal = !sjl.empty(sjl.namespace(nsStr, this.options));
                    if (!retVal) {
                        break;
                    }
                    nsStr += '.' + parts[i];
                }
            }
            else {
                retVal = !sjl.empty(sjl.namespace(nsString, this.options));
            }

            return retVal;
        }

    }); // end of Bundle

