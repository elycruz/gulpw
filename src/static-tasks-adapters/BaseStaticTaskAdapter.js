/**
 * Created by edelacruz on 9/19/2014.
 */

'use strict';

require('sjljs');

module.exports = sjl.Optionable.extend(function BaseStaticTaskAdapter() {
        sjl.Optionable.call(this, arguments);
    },
    {
        registerStaticTask: function (/*gulp, wrangler*/) {
            // override from extending class
        }
    });
