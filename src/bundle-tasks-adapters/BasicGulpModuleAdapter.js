/**
 * Created by elydelacruz on 10/3/15.
 */

'use strict';

require('sjljs');

var fs = require('fs'),
    csslint = require('gulp-csslint'),
    chalk = require('chalk'),
    duration = require('gulp-duration'),
    path = require('path'),
    callback = require('gulp-fncallback'),
    BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    lazypipe = require('lazypipe');

module.exports = BaseBundleTaskAdapter.extend(function BasicGulpModuleAdapter () {}, {
    getPipeOptions: function () {},
    getPipe: function () {}
});
