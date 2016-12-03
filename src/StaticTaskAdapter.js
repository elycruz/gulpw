/**
 * Created by elydelacruz on 2/3/16.
 */
/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

let sjl = require('sjljs'),
    TaskAdapterConfig = require('./TaskAdapterConfig'),
    TaskAdapter = require('./TaskAdapter');

class StaticTaskAdapter extends TaskAdapter {
    register () {
        return this;
    }
}

module.exports = StaticTaskAdapter;
