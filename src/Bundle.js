/**
 * Created by edelacruz on 9/19/2014.
 */

require('sjljs');

modules.export = (function () {
    return sjl.Extendable.extend(function Bundle (config) {
        this.config = config || {};
    }, {
        setupHasMethods: function (config) {
            var self = this;
            Object.keys(config).forEach(function (key) {
                var methodName = sjl.camelCase('has-' + key, true);
                if (!self.hasOwnProperty(methodName) || !sjl.classOfIs(self[methodName], 'Function')) {
                    self[methodName] = function () {
                        return self.config.hasOwnProperty(key);
                    }
                }
            });
        }
    });
});
