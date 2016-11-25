/**
 * Created by Ely on 12/20/2014.
 */
define(['sjl'], function () {

    'use strict';

    return sjl.Extendable.extend(function WebGlContext(elmOrSelector) {
            var self = this,
                gl = null,
                elm = null,
                classOfElmOrSelector = sjl.classOf(elmOrSelector),
                selector = null;

            // Bail if init param is empty
            if (sjl.empty(elmOrSelector)) {
                throw new Error('`sjl.WebGlContext` requires parameter 1 to be ' +
                    'either an HtmlElement or a String.' +
                    'Parameter type recieved "' + classOfInitParam + '".');
                return this;
            }

            // Fetch glcontext based on init param type
            switch (classOfElmOrSelector) {
                case 'HTMLCanvasElement':
                    gl = self.getGlContextFromElm(elmOrSelector);
                    break;
                case 'String':
                    selector = elmOrSelector;
                    elm = document.querySelector(elmOrSelector);
                    gl = self.getGlContextFromElm(elm);
                    break;
                default:
                    selector = elmOrSelector;
                    elm = document.querySelector(elmOrSelector);
                    gl = self.getGlContextFromElm(elm);
                    break;
            }

            // Set gl instance
            self.glInstance = gl;

            // Save the gl element for later use
            self.element = elm;

            // Save selector for later use
            self.selector = selector;

        },
        {
            getGlContextFromElm: function (canvasElm) {
                var gl = null,
                    failureMessage = 'Failed to get webgl context. ' +
                        ' Could not get gl context for this browser.';

                if (!sjl.classOfIs(canvasElm.getContext, 'Function')) {
                    throw new Error(failureMessage);
                    alert(failureMessage);
                }

                try {
                    // Try to grab the standard context. If it fails, fallback to experimental.
                    gl = canvasElm.getContext('webgl')
                        || canvasElm.getContext('experimental-webgl');
                }
                catch (e) {
                    throw new Error(failureMessage);
                    alert(failureMessage);
                }

                return gl;
            }
        });
});