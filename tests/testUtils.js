/**
 * Created by u067265 on 2/16/17.
 */
/**
 * Created by elyde on 12/10/2016.
 */
'use strict';

// ~~~ STRIP ~~~
// This part gets stripped out when
// generating browser version of test(s).
let {curry2} =  require('fjl'),
    {expect} = require('chai');
// These variables get set at the top IIFE in the browser.
// ~~~ /STRIP ~~~

let hasOwnProperty = (instance, key) => Object.prototype.hasOwnProperty.call(instance, key),

    expectInstanceOf = curry2((value, instance) => expect(value).to.be.instanceOf(instance)),

    expectFunction = value => expectInstanceOf(value, Function),

    expectEqual = curry2((value, value2) => expect(value).to.be.equal(value2)),

    expectFalse = value => expectEqual(value, false),

    expectTrue = value => expectEqual(value, true),

    expectHasOwnProperty = curry2((obj, key) => expectTrue(hasOwnProperty(obj, key)));

module.exports = {
    expectFunction,
    expectInstanceOf,
    expectEqual,
    expectFalse,
    expectTrue,
    expectHasOwnProperty,
    hasOwnProperty
};
