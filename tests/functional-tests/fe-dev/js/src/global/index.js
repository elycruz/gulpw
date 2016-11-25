/**
 * Created by edelacruz on 12/5/2014.
 */
'use strict';

var App = {};

// Template function setup
(function () {

    var templates = {};

    App.setTemplate = function (key, value) {
        var errMessage;
        if (sjl.classOfIs(key, 'String') && sjl.classOfIs(value, 'String')) {
            templates[key] = value;
        }
        else {
            errMessage = 'Could not set template\'s key for key "' + key + '" and value "' + value + '"';
            console.warn(errMessage);
            throw new Error(errMessage);
        }
    };

    App.getTemplate = function (key) {
        return sjl.isset(templates[key]) ? templates[key] : null;
    };

}());
