/**
 * Created by edelacruz on 9/19/2014.
 */

require('sjljs');

module.exports = (function () {

    var Bundle = sjl.Extendable.extend(function Bundle () {},
        {}, {
            bundles_path: ""
        });

    return Bundle;

}());
