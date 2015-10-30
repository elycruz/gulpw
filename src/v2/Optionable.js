/**
 * Created by elydelacruz on 10/25/15.
 */

"use strict";

class Optionable {

    constructor (options, optionsKey) {
        this.optionsKey = optionsKey;
        this[this.optionsKey] = {};
       sjl.extend(true, this[this.optionsKey], options);
    }

    getOption (keyOrObj) {

    }

    getOptions (array) {

    }

    setOption (key, value) {

    }

    setOptions (obj) {

    }


}