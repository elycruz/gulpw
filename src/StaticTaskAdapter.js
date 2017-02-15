/**
 * Created by elydelacruz on 2/3/16.
 */
/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

let TaskAdapter = require('./TaskAdapter');

class StaticTaskAdapter extends TaskAdapter {
    register () {
        return this;
    }
}

module.exports = StaticTaskAdapter;
