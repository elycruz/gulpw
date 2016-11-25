/**
 * Created by Ely on 12/21/2014.
 */
define([
    'lib/mvc/module/Module',
    'lib/webgl/WebGl',
    'jquery' ], function (Module, WebGl) {

    'use strict';

    var Constructor = Module.extend(function WebGlExperiments() {
        Module.call(this);
        this.addInitializer(this.init);
    },
        {
            init: function () {
                $('body').append('<canvas id="canvas" width="550px" height="400px"' +
                ' style="background: #ff0000;"></canvas>');
                var gl = new WebGl('#canvas');
                console.log('WebGlExperiments module just ran.');
            }
        });

    return new Constructor();

});

