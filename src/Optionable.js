/**
 * Created by Ely on 12/17/2014.
 */

require('sjljs');

var Utils = require('Utils');

module.exports = sjl.Optionable.extend(function Optionable(options) {

    sjl.Optionable.call(true, this, {}, sjl.argsToArray(arguments));
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