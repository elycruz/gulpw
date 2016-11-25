/**
 * Created by Ely on 12/21/2014.
 */
define(['sjl', 'amplify'], function () {

    'use strict';

    return sjl.Extendable.extend(function Module() {
            this.initializers = [];
            amplify.subscribe('app:start', this, this.runInitializers);
        },
        {
            runInitializers: function () {
                var self = this;
                self.initializers.forEach(function (init) {
                    init.call(self);
                });
            },

            addInitializer: function (callback) {
                this.initializers.push(callback);
            }
        });
});

