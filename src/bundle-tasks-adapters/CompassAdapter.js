/**
 * Created by edelacruz on 10/8/2014.
 */
/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
'use strict'; require('sjljs');



// Import base task proxy to extend
var BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
	path = require('path'),
	child_process = require('child_process'),
	exec = child_process.exec,
	chalk = require('chalk');

module.exports = BaseBundleTaskAdapter.extend('CompassAdapter', {

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
		var configrb = path.normalize(bundle.options.compass.configrb),
			taskName = 'compass:' + bundle.options.alias;

		// Register compass task
		gulp.task(taskName, function () {

			return (new Promise(function (fulfill, reject) {

				var startDate = new Date();

				console.log(chalk.cyan('Running "' + taskName + '" task.\n'));

				var compassTask = exec('cd ' + path.dirname(configrb) + ' && compass compile', function (err, stdout, stderr) {
					// Command(s) output
					console.log(stdout, '\n');

					// If stderr
					if (stderr) {
						console.log('`compass compile` stderr: \n' + stderr + '\n');
					}

					// If error
					if (err) {
						console.log('`compass compile` error: \n', err, '\n');
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

					console.log(chalk.cyan('"' + taskName + '" task ' + actionWord + '.  ' +
					'Duration: ' + chalk.magenta((((new Date()) - startDate) / 1000) +
					'ms')));
				});

			})); // end of promise

		}); // end of gulp task
		
    }, // end of `registerBundle`
	
	registerBundles: function (bundles, gulp, wrangler) {
		var self = this,
            targets = [];

		// Loop through bundles and register the ones that have `compass` key
		bundles.forEach(function (bundle) {
			// If bundle has `compass` key push it's task name to targets array
			if (bundle.has('compass')) {
				targets.push('compass:' + bundle.options.alias);
                self.registerBundle(bundle, gulp, wrangler);
			}
		});

		// Register global `compass` task
		gulp.task('compass', function () {
			console.log(chalk.cyan(' Running "compass" task(s).  Task(s) messages below -->'));
			if (targets.length > 0) {
				return wrangler.launchTasks(targets, gulp);
			}
			return Promise.resolve();
		});
	}

}); // end of export
