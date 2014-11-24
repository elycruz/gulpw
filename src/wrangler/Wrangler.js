/**
 * Created by Ely on 10/4/2014.
 */
require("sjljs");

var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    chalk = require('chalk'),

    // Recursive mkdir (makes all paths in passed path)
    mkdirp = require('mkdirp'),

    Bundle = require(path.join(__dirname, "../bundle/Bundle.js")),

    throwBundleFileNotExistError = function (bundleName, filePath) {
        throw Error('Bundle "' + bundleName + '" config file doesn\'t exist.  Path checked: ' + filePath);
    },

    log;

module.exports = sjl.Extendable.extend(function Wrangler(gulp, argv, env, config) {
    var defaultOptions = yaml.safeLoad(fs.readFileSync(
            path.join(__dirname, "/../../configs/default.wrangler.config.yaml"))),
        taskProxyMap = yaml.safeLoad(fs.readFileSync(
            path.join(__dirname, "/../../configs/default.task.proxy.map.yaml"))),
        self = this;

        log = self.log;

    sjl.extend(true, self, {
        bundles: {},
        cwd: env.configBase,
        argv: argv,
        taskProxyMap: taskProxyMap,
        taskStrSeparator: ":",
        tasks: {}
    }, defaultOptions, config);

    // Resolve bundles path
    self.bundlesPath = path.join(self.cwd, self.bundlesPath);
    self.init(gulp, self.argv);
},

{
    init: function (gulp, argv) {
        var self = this,
            anyGlobalTasksToRun;

        self.log("Gulp Bundle Wrangler initializing...");

        // Check if we have any global tasks to run
        anyGlobalTasksToRun = argv.all || (argv._.filter(function (item) {
            return item.indexOf(':') === -1;
        })).length > 0;

        // Create task proxies (@todo in the future only load needed tasks if it makes any difference in performance)
        self.createTaskProxies(gulp);


        // If any global tasks to run create tasks proxies and register all bundles.
        if (anyGlobalTasksToRun) {
            self.createBundles(gulp);
            self.registerGlobalTasks(gulp);
        }

        // No global tasks to run (tasks on all modules) so register only passed in bundle(s)
        else {
            self.createBundles(gulp, self.extractBundlePathsFromArgv(argv));
        }

        self.launchTasks(argv._, gulp);
    },

    createTaskProxies: function (gulp) {
        var self = this;

        // Creating task proxies message
        self.log("- Creating task proxies.");

        Object.keys(self.tasks).forEach(function (task) {
            self.tasks[task].instance = self.createTaskProxy(gulp, task);
        });

        return self;
    },

    createTaskProxy: function (gulp, task) {
        // "Creating task ..." message
        this.log("Creating task proxy \"" + task + "\".  constructor at: \"" +
            this.taskProxyMap[task].constructorLocation + "\"");

        var self = this,
            src = self.taskProxyMap[task].constructorLocation,
            TaskClass = require(path.join(__dirname, '../', src));

        return new TaskClass(gulp);
    },

    createBundles: function (gulp, bundles) {
        var self = this,
            bundlesPath;

        // Creating task proxies message
        self.log("- Creating bundles.");

        bundlesPath = self.bundlesPath;

        // Get bundles
        if (!bundles) {
            bundles = fs.readdirSync(bundlesPath);
        }

        // Parse bundle configs
        bundles.forEach(function (fileName) {
            var bundle = self.createBundle(fileName);
            self.registerTasksForBundle(gulp, bundle);
        });
    },

    createBundle: function (config) {

        if (sjl.classOfIs(config, 'String')) {
            config = this.getBundleConfigByName(config);
        }

        if (sjl.empty(config)) {
            return; // @todo throw exception here
        }

        // "Creating task ..." message
        this.log('Creating bundle "' + config.name + '"');

        var bundle = new Bundle(config);

        // Store bundle
        this.bundles[bundle.options.name] = bundle;

        // Return bundle
        return bundle;
    },

    registerTasksForBundle: function (gulp, bundle) {
        var self = this;

        // Register bundle with task
        Object.keys(self.tasks).forEach(function (task) {
            self.tasks[task].instance.registerBundle(bundle, gulp, self);
        });
    },

    registerGlobalTasks: function (gulp) {
        var self = this,
            tasks = Object.keys(self.tasks),
            bundles = self.bundlesToArray();

        // Pass all bundles to each task
        tasks.forEach(function (task) {
            self.tasks[task].instance.registerBundles(bundles, gulp, self);
        });
    },

    bundlesToArray: function () {
        var self = this;
        return Object.keys(self.bundles).map(function (key) {
            return self.bundles[key];
        });
    },


    getTaskStrSeparator: function () {
        var self = this,
            separator = self.taskStrSeparator;
        // Return the separator
        return sjl.classOfIs(separator, 'String') && separator.length > 0
            ? separator : self.defaultTaskStrSeparator;
    },

    getBundleConfigByName: function (name) {
        var configFormat = this.bundleConfigFormat,
            fileName = name.lastIndexOf('.' + configFormat) === name.length - 5 ? name : name + '.' + configFormat,
            filePath = fileName.indexOf(path.sep) > -1 || fileName.indexOf('/') > -1
                ? fileName : path.join(this.bundlesPath, fileName),
            retVal = {},
            file;

        if (!fs.existsSync(filePath)) {
            return retVal;
        }

        file = fs.readFileSync(filePath);

        switch (this.bundleConfigFormat) {
            case 'yaml':
                retVal = yaml.safeLoad(file);
                break;
            default:
                retVal = yaml.safeLoad(file);
                break;
        }

        return retVal;
    },

    extractBundleNamesFromArray: function (list) {
        var parts, extracted = [];
        list.filter(function (item) {
            return /^[a-z\d\-_]+\:[a-z\d\-_]+/i.test(item);
        }).forEach(function (item) {
            parts = item.split(':');
            extracted.push(parts[1]);
        });
        return extracted;
    },

    extractBundlePathsFromArgv: function (argv) {
        argv = argv || this.argv;
        var out = [],
            self = this,
            filePath;

        this.extractBundleNamesFromArray(argv._).forEach(function (item) {
            filePath = path.join(self.bundlesPath, item + '.' + self.bundleConfigFormat);
            if (!fs.existsSync(filePath)) {
                return throwBundleFileNotExistError(item, filePath);
            }
            out.push(filePath);
        });

        return out;
    },

    log: function () {
        var args = sjl.argsToArray(arguments),
            verbose = this.argv.verbose,
            debug = args[args.length - 1] === '--debug',
            debugFlag = this.argv.debug,
            mandatory = args[args.length - 1] === '--mandatory';

        if (debug || mandatory) {
            args.pop();
        }

        if ((verbose && !debug) || mandatory) {
            console.log.apply(console, args);
        }
        else if (debugFlag && debug) {
            args = args.map(function (item) {
                return chalk.dim(item);
            });
            console.log.apply(console, args);
        }

        return this;
    },

    ensurePathExists: function (dirPath) {
        return mkdirp.sync(dirPath);
    },

    launchTasks: function (tasks, gulp) {
        var self = this,
            startDate;

        // loop through tasks and call gulp.start on each
        // @todo gulp is asynchronous;  duration calculation must happen on the stream operation level.
        // @ The timing calculations in the function below are irrelevant.
        tasks.forEach(function (item) {
            // 'Start running task' message
            self.log(chalk.dim('Running ' + item), '--mandatory');

            // Capture start time
            startDate = Date.now();

            // Run task
            gulp.start(item);

            // Log task duration
            self.log(chalk.cyan(item + ' finished - duration: '
            + ((new Date()) - startDate) / 100 + 'ms'), '--mandatory');
        });

    }

});
