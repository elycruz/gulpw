#!/usr/bin/env node
/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */

require('sjljs');

var Liftoff = require('liftoff'),
    argv = require('yargs')
        .alias('d',     'dev')
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
        .alias('skip-jasmine-testing',  'skip-jasmine-tests')
        .alias('skip-mocha-testing',  'skip-mocha-tests')
        .alias('skip-testing',  'skip-tests')
        .alias('no-tests',      'skip-tests')
        .alias('t',     'file-types')
        .alias('x',     'file-types')
        .alias('ext',   'file-types')
        .argv,
    gulp = require('gulp'),
    path = require('path'),
    fs = require('fs'),
    chalk = require('chalk'),
    cli = new Liftoff({
        name: 'gulpw',
        processTitle: 'gulpw',
        moduleName: 'gulpw',
        configName: 'bundle.wrangler.config',
        extensions: {
            '.js': null,
            '.json': null,
            '.yaml': 'js-yaml'
        }
    }),
    Wrangler = require('./src/wrangler/Wrangler'),
    userConfig,
    wrangler;

function init(env) {

    //if (argv.verbose) {
        //console.log('LIFTOFF SETTINGS:', this);
        //console.log('CLI OPTIONS:', argv);
        //console.log('CWD:', env.cwd);
        //console.log('LOCAL MODULES PRELOADED:', env.require);
        //console.log('SEARCHING FOR:', env.configNameRegex);
        //console.log('FOUND CONFIG AT:', env.configPath);
        //console.log('CONFIG BASE DIR:', env.configBase);
        //console.log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
        //console.log('LOCAL PACKAGE.JSON:', env.modulePackage);
        //console.log('CLI PACKAGE.JSON', require('./package'));
    //}

    // If the config path is empty
    if (sjl.empty(env.configPath)) {

        // Copy default config to the environments root
        fs.writeFileSync(path.join(env.cwd, 'bundle.wrangler.config.yaml'),
            fs.readFileSync(path.join(__dirname, '/configs/default.wrangler.config.yaml')));

        // Write message to user
        console.log(chalk.yellow('No \'bundle.wrangler.config.*\' file found.'), '\n',
                chalk.cyan('A \'bundle.wrangler.config.yaml\' file has been created at: \'./bundle.wrangler.config.yaml\'.' +
                'Rerun/run `gulpw config` to help customize your \'bundle.wrangler.config.yaml\' file.')
            );

        // Exit
        return;
    }

    // Change to config's path
    process.chdir(env.configBase);

    // Load config file
    userConfig = Wrangler.prototype.loadConfigFile(env.configPath);

    // Instantiate wrangler
    wrangler = new Wrangler(gulp, argv, env, userConfig);
}

cli.launch({
    cwd: argv.cwd,
    configPath: argv.configFile,
    require: argv.require,
    completion: argv.completion,
    verbose: argv.verbose
}, init);

module.exports = gulp;