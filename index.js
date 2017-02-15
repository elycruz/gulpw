#!/usr/bin/env node

/**
 * Created by Ely on 12/16/2015.
 * @todo allow all gulpw-config.yaml and bundle config options to be passed and merged via the command line
 */

'use strict';

let fjl = require('fjl'),
    gwUtils = require('./src/Utils'),
    initArgv = require('./init-argv-defaults'),
    Liftoff = require('liftoff'),
    yargs = require('yargs'),
    argv = initArgv(yargs),
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
    GulpTaskManager = require('./src/gulp/GulpTaskManager'),
    // defaultConfig = gwUtils.loadConfigFile(path.join(__dirname, '/configs/gulpw-config.yaml')),
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

function initializeTaskManager (userConfig, env) {
    try {
        taskManager = new GulpTaskManager(fjl.assignDeep({
            argv: argv,                 // Passed in args
            env: env,                   // Currently only added to facilitate tests
            pwd: __dirname,             // Gulpw's pwd
            configPath: env.configPath, // Path of user's 'gulpw-config'
            configBase: env.configBase  // user's cwd
        }, userConfig));
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
    if (fjl.isEmpty(env.configPath) || !calledWithAllowedTaskNames()) {
        // Write message to user
        console.log(chalk.yellow('\nNo \'gulpw-config.*\' file found.\n'));
    }
    else if (!fjl.isEmpty(env.configPath)) {

        // Change to config's path
        process.chdir(env.configBase);

        // Load config file
        userConfig = gwUtils.loadConfigFile(env.configPath);
        initializeTaskManager(userConfig, env);
    }
}

function init () {
    // Laucn cli process
    cli.launch({
        cwd: argv.cwd,
        configPath: argv.configFile,
        require: argv.require,
        completion: argv.completion,
        verbose: argv.verbose
    }, cliInit);
}

init ();

process.on('error', console.log);
process.on('uncaughtException', console.log);
process.on('unhandledRejection', console.log);

module.exports = gulp;
