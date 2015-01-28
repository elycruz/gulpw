/**
 * Created by edelacruz on 10/8/2014.
 */
/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
'use strict'; require('sjljs');

require('es6-promise').polyfill();

// Import base task proxy to extend
var TaskProxy = require('../TaskProxy'),
	path = require('path'),
	child_process = require('child_process'),
	exec = child_process.exec,
	chalk = require('chalk');

module.exports = TaskProxy.extend('CompassProxy', {

    /**
     * Regsiters bundle with `compass` or `sass` gulp task.
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

		// Bail if bundle doesn't have `compass` key
		if (!bundle.has('compass')) {
			return;
		}

		// Compass project root directory (config.rb home)
		var compassProjectRoot = path.normalize(bundle.options.compass.compassProjectRoot),
			taskName = 'compass:' + bundle.options.alias;

		// Register compass task
		gulp.task(taskName, function () {

			return (new Promise(function (fulfill, reject) {

				var startDate = new Date();

				wrangler.log(chalk.cyan(' \nRunning "' + taskName + '" task:\n'), '--mandatory');

				var compassTask = exec('cd ' + compassProjectRoot + ' && compass compile', function (err, stdout, stderr) {
					// Command(s) output
					console.log(stdout);

					// If stderr
					if (stderr) {
						console.log('`compass compile` stderr: ' + stderr);
					}

					// If error
					if (err) {
						console.log('`compass compile` error: ', err);
					}
				});

				// On command close print duration
				compassTask.on('close', function (code) {
					var actionWord = '';

					// Figure out close state
					switch (code) {
						case 0:
							actionWord = chalk.green('completed');
							fulfill();
							break;
						default:
							console.log('`compass compile` exited with code ' + code);
							actionWord = chalk.red('did not complete');
							reject('`compass compile` exited with code "' + code + '".');
							break;
					}

					wrangler.log(chalk.cyan('"' + taskName + '" task ' + actionWord + '.  ' +
					'Duration: ' + chalk.magenta((((new Date()) - startDate) / 1000) +
					'ms')), '--mandatory');
				});

			})); // end of promise

		}); // end of gulp task
		
    }, // end of `registerBundle`
	
	registerBundles: function (bundles, gulp, wrangler) {
		var targets = [];

		// Loop through bundles and register the ones that have `compass` key
		bundles.forEach(function (bundle) {
			// If bundle has `compass` key push it's task name to targets array
			if (bundle.has('compass')) {
				targets.push('compass:' + bundle.options.alias);
			}
		});

		// Register global `compass` task
		gulp.task('compass', function () {
			wrangler.log(chalk.cyan(' \nRunning "compass" task:'), '--mandatory');
			if (targets.length > 0) {
				return wrangler.launchTasks(targets, gulp);
			}
			return Promise.resolve();
		});
	}

}); // end of export
