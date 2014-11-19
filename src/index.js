/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
var yaml = require('js-yaml'),
    Wrangler = require('./Wrangler'),
    wrangler = new Wrangler(),
    gulp = wrangler.init( require('gulp') );

module.exports = gulp;