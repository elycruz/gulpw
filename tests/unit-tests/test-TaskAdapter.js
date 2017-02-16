/**
 * Created by Ely on 7/3/2016.
 */
/**
 * Created by Ely on 12/18/2015.
 */

'use strict';

let chai = require('chai'),
    expect = chai.expect,
    sjl = require('sjljs'),
    TaskAdapter = require('./../../src/TaskAdapter'),
    hasOwnProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

describe('TaskAdapter', function () {

    describe ('properties', function () {
        let taskAdapter = new TaskAdapter();
        it ('should have the required properties', function () {
            ['config', 'taskManager'].forEach((key) => {
                expect(hasOwnProperty(taskAdapter, key)).to.equal(true);
            });
        });
    });

});
