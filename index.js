#!/usr/bin/env node
/**
 * Created by ElyDeLaCruz on 11/18/2014.
 */
var yaml = require('js-yaml'),
    fs = require('fs'),
    Liftoff = require('liftoff'),
    argv = require('yargs').argv,
    gulp = require('gulp'),
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
    Wrangler = require('./src/Wrangler'),
    userConfig,
    wrangler;

function init(env) {
    if (argv.verbose) {
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
    }

    if (env.configPath) {

        //console.log(process.argv,__dirname);
        process.chdir(env.configBase);

        userConfig = yaml.safeLoad(fs.readFileSync(env.configPath));

        wrangler = new Wrangler(gulp, argv, env, userConfig);

        //require(env.configPath);

    } else {
        console.log('No \'bundle.wrangler.config.*\' file found.');
    }
}

cli.launch({
    cwd: argv.cwd,
    configPath: argv.bwfile,
    require: argv.require,
    completion: argv.completion,
    verbose: argv.verbose
}, init);

module.exports = gulp;