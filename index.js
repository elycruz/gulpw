#!/usr/bin/env node

/**
 * Created by Ely on 12/16/2015.
 * @todo allow all gulpw-config.yaml and bundle config options to be passed and merged via the command line
 */

'use strict';

// Utils library
var sjl = require('sjljs'),

    // GulpWrangler Utils
    gwUtils = require('./build/utils/Utils'),

    // Launcher
    Liftoff = require('liftoff'),

    // Command line arguments config
    argv = require('yargs')

        // Default param values
        .default('skip-artifacts',  false)
        .default('bundle',          null)
        .default('async',           false)
        .default('force',           false)
        .default('out',             null)

        // Command line param alias
        .alias('o',                 'out')
        .alias('a',                 'async')
        .alias('d',                 'dev')
        .alias('f',                 'force')
        .alias('g',                 'topLevelConfig')
        .alias('v',                 'verbose')
        .alias('skip-css-hint',     'skip-css-linting')
        .alias('skip-css-lint',     'skip-css-linting')
        .alias('skip-css-hinting',  'skip-css-linting')
        .alias('skip-js-hint',      'skip-js-linting')
        .alias('skip-js-lint',      'skip-js-linting')
        .alias('skip-js-hinting',   'skip-js-linting')
        .alias('skip-hinting',      'skip-linting')
        .alias('skip-hint',         'skip-linting')
        .alias('skip-lint',         'skip-linting')
        .alias('skip-jasmine',      'skip-jasmine-tests')
        .alias('skip-mocha',        'skip-mocha-tests')
        .alias('skip-testing',      'skip-tests')
        .alias('skip-hashing',      'skip-hashes')
        .alias('skip-related',      'skip-related-bundles')
        .alias('show-files',        'show-file-sizes')
        .alias('filetypes',         'file-types')
        .alias('filetype',          'file-types')
        .alias('ext',               'file-types')
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
    TaskManager = require('./build/TaskManager'),
    userConfig, taskManager;

function logPertinent (env) {
    // Dump pertinent environment variables
    if (argv.dumpEnv) {
        console.log('process.argv:',                process.argv);
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
}

function calledWithAllowedTaskNames () {
    return process.argv[1].indexOf('gulpw') > -1
        || process.argv[1].indexOf('gulp') > -1;
}

function initializeTaskManager (userConfig) {
    // Instantiate TaskManager
    try {
        TaskManager = new TaskManager(sjl.extend(true, {
            taskRunner: gulp,
            argv: argv,
            env: env,
            configPath: env.configPath,
            configBase: env.configBase
        }, userConfig))
    }
    catch (e) {
        console.log('Uncaught Error: \n',
            e.message + ' \n',
            'Line number: ' + e.lineNumber + ' \n',
            e.stack);
    }
}

function cliInit(env) {
    // Log pertinent info if necessary
    logPertinent(env);

    // Set process' working directory
    env.pwd = __dirname;

    // If the config path is empty
    if (sjl.empty(env.configPath) || !calledWithAllowedTaskNames()) {
        // Write message to user
        console.log(chalk.yellow('\nNo \'gulpw-config.*\' file found.'));
    }
    else if (!sjl.empty(env.configPath)) {

        // Change to config's path
        process.chdir(env.configBase);

        // Load config file
        userConfig = gwUtils.loadConfigFile(env.configPath);
        initializeTaskManager(userConfig);
    }
}

// Laucn cli process
cli.launch({
    cwd: argv.cwd,
    configPath: argv.configFile,
    require: argv.require,
    completion: argv.completion,
    verbose: argv.verbose
}, cliInit);

module.exports = gulp;
