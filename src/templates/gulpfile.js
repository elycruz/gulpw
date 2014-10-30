/**
 * Created by edelacruz on 9/19/2014.
 */
var yaml = require('js-yaml'),
    wranglerConfig = yaml.safeLoad('gulp-bundle-wrangler.config.yaml'),
    wrangler = (new require('gulp-bundle-wrangler'))(wranglerConfig),
    gulp = wrangler.init(require('gulp'));
