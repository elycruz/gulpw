#!/usr/bin/env node
/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */

require('sjljs');

var Liftoff =   require('liftoff'),
    argv =      require('yargs')
        .default('skip-artifacts',  false)
        .default('browser',         false)
        .default('bundle',          null)
        .default('async',           false)
        .default('force',           false)
        .alias('b',     'browser')
        .alias('a',     'async')
        .alias('d',     'dev')
        .alias('f',     'force')
        .alias('v',     'verbose')
        .alias('skip-css-hint',     'skip-css-linting')
        .alias('skip-css-lint',     'skip-css-linting')
        .alias('skip-css-hinting',  'skip-css-linting')
        .alias('skip-js-hint',      'skip-js-linting')
        .alias('skip-js-lint',      'skip-js-linting')
        .alias('skip-js-hinting',   'skip-js-linting')
        .alias('skip-hinting',  'skip-linting')
        .alias('skip-hint',     'skip-linting')
        .alias('skip-lint',     'skip-linting')
        .alias('skip-jasmine',          'skip-jasmine-tests')
        .alias('skip-jasmine-testing',  'skip-jasmine-tests')
        .alias('skip-mocha',            'skip-mocha-tests')
        .alias('skip-mocha-testing',    'skip-mocha-tests')
        .alias('skip-testing',  'skip-tests')
        .alias('no-tests',      'skip-tests')
        .alias('filetypes',     'file-types')
        .alias('filetype',     'file-types')
        .alias('t',     'file-types')
        .alias('x',     'file-types')
        .alias('ext',   'file-types')
        .argv,
    gulp =  require('gulp'),
    path =  require('path'),
    fs =    require('fs'),
    chalk = require('chalk'),
    cli = new Liftoff({
        name: 'gulpw',
        processTitle: 'gulpw',
        moduleName: 'gulpw',
        configName: 'gulpw-config',
        extensions: {
            '.js': null,
            '.json': null,
            '.yaml': 'js-yaml'
        }
    }),
    Wrangler = require('./src/Wrangler'),
    userConfig,
    wrangler;

function init(env) {

    // Dump pertinent environment variables
    if (argv.dumpEnv) {
        console.log('LIFTOFF SETTINGS:',             this);
        console.log('CLI OPTIONS:',                  argv);
        console.log('CWD:',                          env.cwd);
        console.log('LOCAL MODULES PRELOADED:',      env.require);
        console.log('SEARCHING FOR:',                env.configNameRegex);
        console.log('FOUND CONFIG AT:',              env.configPath);
        console.log('CONFIG BASE DIR:',              env.configBase);
        console.log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
    }

    // Dumps your local package and gulpw's package files
    if (argv.dumpPackage) {
        console.log('LOCAL PACKAGE.JSON:',           env.modulePackage);
        console.log('CLI PACKAGE.JSON',              require('./package'));
    }

    // If the config path is empty
    if (sjl.empty(env.configPath)) {

        // Write message to user
        console.log(chalk.yellow('No \'gulpw-config.*\' file found.'), '\n',
                chalk.cyan('Create an empty one and then run `gulpw config` to populate it.')
            );

        // Exit
        return process.exit(0);
    }

    // Set process' working directory
    env.pwd = __dirname;

    // Change to config's path
    process.chdir(env.configBase);

    // Load config file
    userConfig = Wrangler.prototype.loadConfigFile(env.configPath);

    // Instantiate wrangler
    try { wrangler = new Wrangler(gulp, argv, env, userConfig) } catch (e) {
        console.log('Uncaught Error: \n',
            e.message + ' \n',
            'Line number: ' + e.lineNumber + ' \n',
            e.stack);
    }
}

cli.launch({
    cwd: argv.cwd,
    configPath: argv.configFile,
    require: argv.require,
    completion: argv.completion,
    verbose: argv.verbose
}, init);

module.exports = gulp;