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
    srcNamespace = require('./../../src/namespace'),
    TaskAdapter = srcNamespace.TaskAdapter;

describe('TaskAdapter', function () {

    describe ('properties', function () {
        let taskAdapter = new TaskAdapter();
        ['config', 'taskManager'].forEach((key) => {
            expect(taskAdapter.hasOwnProperty(key)).to.equal(true);
        });
    });


});
