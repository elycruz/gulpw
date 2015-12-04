/**
 * Created by elydelacruz on 10/25/15.
 */

"use strict";

const sjl = require('sjljs');

class Optionable {

    constructor (options, optionsKey) {
        var notAllowedKeys = Object.keys(this);
        if (notAllowedKeys.indexOf(optionsKey) > -1) {
            throw new Error ('`Optionable`\'s constructor received an un-allowed key as `optionsKey`.  Please choose an option ' +
                'key that is not one of the following keys: ' + notAllowedKeys.join(', '));
        }
        this.optionsKey = optionsKey;
        this[this.optionsKey] = {};
       sjl.extend(true, this[this.optionsKey], options);
    }

    getOption (key) {
        return this[this.optionsKey][key] || null;
    }

    getOptions (array) {
        var options = this[this.optionsKey],
            out = {};
        array.forEach(function (option) {
            out[option] = options[option];
        });
        return out;
    }

    setOption (key, value) {
        var classOfKey = sjl.classOf(key);
        if (classOfKey !== 'String') {
            throw new Error('`Optionable.prototype.setOption` expects' +
                ' `key` param to be of type `String`.  Value of type "' + classOfKey + '" given.');
        }
        this[this.optionsKey][key] = value;
        return this;
    }

    setOptions (obj) {
        sjl.extend(true, this[this.optionsKey], obj);
        return this;
    }

    hasOption (key) {
    }

}