/**
 * Created by edelacruz on 9/19/2014.
 */

'use strict';

require('sjljs');

module.exports = sjl.Optionable.extend(function BaseStaticTaskAdapter(options) {
        sjl.Optionable.call(this, options);
    },
    {
        registerStaticTask: function (gulp, wrangler) {
            // override from extending class
        }
    });