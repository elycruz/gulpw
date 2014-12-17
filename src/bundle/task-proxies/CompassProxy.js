/**
 * Created by edelacruz on 10/8/2014.
 */
/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
"use strict"; require("sjljs");

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
	exec = require('child_process').exec;

module.exports = TaskProxy.extend("CompassProxy", {

    /**
     * Regsiters bundle with `compass` or `sass` gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {
		if (!bundle.has('compass')) {
			return;
		}
		
		gulp.task('compass:' + bundle.options.alias, function () {		
			exec('compass compile', function (error, stdout, stderr) {
				console.log('compass compile stdout: ' + stdout);
				console.log('compass compile stderr: ' + stderr);
				if (error !== null) {
				  console.log('exec error: ' + error);
				}
			});	
		});
		
    }, // end of `registerBundle`
	
	registerBundles: function (bundles, gulp, wrangler) {
		var self = this,
			targets = [];

		bundles.forEach(function (bundle) {
			self.registerBundle(bundle);
			if (bundle.has('compass')) {
				targets.push('compass:' + bundle.options.alias);
			}
		});

			gulp.task('compass', function () {
				if (targets.length > 0) {
					wrangler.launchTasks(targets, gulp);
				}
			});
	}
}); // end of export
