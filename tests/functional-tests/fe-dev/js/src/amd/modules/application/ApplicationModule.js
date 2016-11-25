/**
 * Created by edelacruz on 12/5/2014.
 * @description Mock application object.
 */
define(['lib/mvc/module/Module', 'jquery', 'amplify'], function (Module) {

    'use strict';

    // Mock application obj
    var baseConstructor = function Application() {},
        Constructor = sjl.Extendable.extend(baseConstructor, {
            run: function () {

                // Use jquery
                $('#main-content').html('<h3>Application launched!</h3>');

                // Log to console
                console.log('Application launched');

                // Use amplify
                amplify.publish('app:start');

            }
        });

    return new Constructor();

});

