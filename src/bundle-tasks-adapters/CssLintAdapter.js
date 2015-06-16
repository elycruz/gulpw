/**
 * Created by edelacruz on 10/8/2014.
 */
/**
 * Created by edelacruz on 10/8/2014.
 */
'use strict'; require('sjljs');

var fs = require('fs'),
    csslint = require('gulp-csslint'),
    chalk = require('chalk'),
    duration = require('gulp-duration'),
    path = require('path'),
    callback = require('gulp-fncallback'),
    BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    lazypipe = require('lazypipe');

module.exports = BaseBundleTaskAdapter.extend('CssLintAdapter', {

    /**
     *
     * @param bundle {Bundle}
     * @param gulp {gulp}
     * @param wrangler {Wrangler}
     */
    registerBundle: function (bundle, gulp, wrangler) {

        // Task string separator
        var self = this,
            cssLintPipe = self.getPipe(bundle, gulp, wrangler);

        gulp.task('csslint:' + bundle.options.alias, function () {
            return gulp.src(bundle.options.files.css)
                .pipe(cssLintPipe());
        });

    }, // end of `registerBundle`

    registerBundles: function (bundles, gulp, wrangler) {
        // Task string separator
        var self = this,
            cssLintConfig = wrangler.tasks.csslint.options,
            targets = [];

        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            self.registerBundle(bundle, gulp, wrangler);
            targets = targets.concat(bundle.options.files.css);
        });

        gulp.task('csslint', function () {
            wrangler.log(chalk.cyan(' Running "csslint" task(s).  Task messages below:\n'));
            return gulp.src(targets)
                .pipe(duration(chalk.cyan('csslint "all bundles" duration')))
                .pipe(csslint(cssLintConfig))
                .pipe(csslint.reporter());
        });
    },

    isBundleValidForTask: function (bundle) {
        return bundle && bundle.has('files.css');
    },

    getPipe: function (bundle, gulp, wrangler) {
        var self = this,
            cssLintConfig = wrangler.tasks.csslint.csslintrc || wrangler.tasks.csslint.options,
            outputDir = wrangler.argv.out,
            runOutput = '',
            getLineMessage,
            getColoredLineMessage,
            saveOutputReporter;

        // Ensure an absolute path if `cssLintConfig` is a 'String'
        if (sjl.classOfIs(cssLintConfig, 'String')) {
            // If given path doesn't exist, throw an exception
            if (!fs.existsSync(cssLintConfig)) {
                throw new Error('The specified \'.csslintrc\' file specified in the `csslint` ' +
                    'config could not be found.  \'.csslintrc\' path received: "' + cssLintConfig + '".');
            }
            else {
                cssLintConfig = JSON.parse(fs.readFileSync(cssLintConfig));
            }
        }

        if (sjl.empty(self.pipe)) {

            getLineMessage = function (result) {
                var humanType = sjl.camelCase(result.error.type, true);
                return '[' + result.error.line + ':' + result.error.col + '] - ' +
                    humanType + ': ' + result.error.message + ' (' + result.error.rule.id + ')';
            };

            getColoredLineMessage = function (result) {
                var humanType = sjl.camelCase(result.error.type, true);
                humanType = result.error.type === 'error' ? chalk.red(humanType) : chalk.yellow(humanType);
                return chalk.red('[') + chalk.yellow(result.error.line) + chalk.red(':') + chalk.yellow(result.error.col) + chalk.red(']') + ' - ' +
                        humanType + ': ' + result.error.message + chalk.dim(result.error.rule.desc) + ' ' + ' (' + result.error.rule.id + ') ';
            };

            saveOutputReporter = function(file) {
                runOutput += 'Csslint found ' + file.csslint.errorCount + ' errors in ' + file.path;
                console.log('\n' + chalk.cyan('Csslint') + ' found ' + file.csslint.errorCount + ' errors in ' + chalk.magenta(file.path));
                file.csslint.results.forEach(function(result) {
                    runOutput += '\n' + getLineMessage(result);
                    console.log(getColoredLineMessage(result));
                });
            };

            self.pipe = lazypipe()
                .pipe(duration, chalk.cyan('csslint "' + bundle.options.alias + '" duration'))
                .pipe(csslint, cssLintConfig)
                .pipe(csslint.reporter, saveOutputReporter);

            if (outputDir !== null) {
                self.pipe = self.pipe.pipe(callback, function (file, enc, cb) {
                    if (!file.csslint.success) {
                        var outputFilePath = path.join(outputDir, path.basename(file.path) + '.txt');
                        wrangler.ensurePathExists(outputDir);
                        fs.writeFileSync(outputFilePath, runOutput);
                        runOutput = '';
                    }
                    return cb();
                });
            }

        }
        return self.pipe;
    }
});
