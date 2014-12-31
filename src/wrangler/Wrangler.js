/**
 * Created by Ely on 10/4/2014.
 */

'use strict';

require('sjljs');

var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    chalk = require('chalk'),

    // Recursive mkdir (makes all paths in passed path)
    mkdirp = require('mkdirp'),

    Bundle = require(path.join(__dirname, '../bundle/Bundle.js')),

    log;

module.exports = sjl.Optionable.extend(function Wrangler(gulp, argv, env, config) {
    var self = this,
        defaultOptions = self.loadConfigFile(path.join(__dirname, '/../../configs/default.wrangler.config.yaml')),
        taskProxyMap = self.loadConfigFile(path.join(__dirname, '/../../configs/default.task.proxy.map.yaml'));

        log = self.log;

    sjl.extend(true, self, {
        bundles: {},
        cwd: env.configBase,
        argv: argv,
        taskProxyMap: taskProxyMap,
        taskStrSeparator: ':',
        tasks: {},
        staticTasks: {}
    }, defaultOptions, config);

    // Resolve bundles path
    self.bundlesPath = path.join(self.cwd, self.bundlesPath);

    // Initialize the pipeline call(s)
    self.init(gulp, self.argv);
},

{
    init: function (gulp, argv) {
        var self = this,
            anyGlobalTasksToRun;

        self.log('Gulp Bundle Wrangler initializing...');

        // Check if we have any global tasks to run
        anyGlobalTasksToRun = argv.all || (argv._.filter(function (item) {
            return item.indexOf(':') === -1;
        })).length > 0;

        // Create static tasks
        if (argv._.indexOf('prompt:deploy') > -1) {
            self.createStaticTaskProxies(gulp);
        }

        // Else create task proxies and bundle(s) if necessary
        else {

            // Create task proxies (~~@todo in the future only load needed tasks if it makes any difference in performance~~  Can't do this as some tasks access other task proxies internally at task runtime)
            self.createTaskProxies(gulp);

            // If any global tasks to run create tasks proxies and register all bundles.
            if (anyGlobalTasksToRun && argv._.length > 0) {
                self.createBundles(gulp);
                self.registerGlobalTasks(gulp, argv._);
            }

            // No global tasks to run (tasks on all modules) so register only passed in bundle(s)
            else {
                self.createBundles(gulp, self.extractBundlePathsFromArgv(argv));
            }
        }

        self.launchTasks(argv._, gulp);
    },

    createStaticTaskProxies: function (gulp) {
        var self = this;

        // Creating task proxies message
        self.log('- Creating static task proxies.');

        Object.keys(self.staticTasks).forEach(function (task) {
            self.staticTasks[task].instance = self.createStaticTaskProxy(gulp, task);
        });

        return self;
    },

    createTaskProxies: function (gulp) {
        var self = this;

        // Creating task proxies message
        self.log(chalk.cyan('\n- Creating task proxies.'));

        Object.keys(self.tasks).forEach(function (task) {
            self.tasks[task].instance = self.createTaskProxy(gulp, task);
        });

        return self;
    },

    createTaskProxy: function (gulp, task) {
        // 'Creating task ...' message
        this.log(' - Creating task proxy \"' + task + '\'.');

        var self = this,
            src = self.taskProxyMap[task].constructorLocation,
            TaskProxyClass = require(path.join(__dirname, '../', src));

        return new TaskProxyClass({
            alias: task,
            help: self.taskProxyMap.help
        });
    },

    createStaticTaskProxy: function (gulp, task) {
        // 'Creating task ...' message
        this.log(chalk.cyan('\n- Creating static task proxy \"' + task + '\'.'));

        var self = this,
            src = self.taskProxyMap[task].constructorLocation,
            TaskProxyClass = require(path.join(__dirname, src));

        TaskProxyClass = new TaskProxyClass({
            name: task,
            help: self.taskProxyMap.help
        });

        TaskProxyClass.registerStaticTasks(gulp, self);

        return TaskProxyClass;
    },

    createBundles: function (gulp, bundles) {
        var self = this,
            bundlesPath;

        // Creating task proxies message
        self.log(chalk.cyan('\n- Creating bundles.'));

        bundlesPath = self.bundlesPath;

        // Get bundles
        if (!bundles) {
            bundles = fs.readdirSync(bundlesPath);
        }

        // Parse bundle configs
        bundles.forEach(function (fileName) {
            var bundle = self.createBundle(path.join(bundlesPath, fileName));
            self.registerTasksForBundle(gulp, bundle);
        });
    },

    createBundle: function (config) {
        var filePath = path.relative(process.cwd(), config),
            bundle;

        // If config is of type 'String' we assume a path
        if (sjl.classOfIs(config, 'String')) {
            config = this.loadConfigFile(config);
        }

        if (sjl.empty(config)) {
            return; // @todo throw exception here
        }

        // 'Creating task ...' message
        this.log(' - Creating bundle "' + config.alias + '"');

        // Set original bundle file location to bundle.config
        config.filePath = '.' + path.sep + filePath;

        // Create bundle
        bundle = new Bundle(config);

        // Store bundle
        this.bundles[bundle.options.alias] = bundle;

        // Return bundle
        return bundle;
    },

    registerTasksForBundle: function (gulp, bundle) {
        var self = this;
            //tasksPassedIn = self.argv._;

        // Register bundle with task
        Object.keys(self.tasks).forEach(function (task) {

            // Only attempt to register bundle for tasks that were passed in the command line arguments
            //if (tasksPassedIn.indexOf(task + ':' + bundle.options.alias)
            //|| tasksPassedIn.indexOf(task)) {
                self.tasks[task].instance.registerBundle(bundle, gulp, self);
            //}
        });
    },

    registerGlobalTasks: function (gulp, tasks) {
        var self = this,
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
            filePath = self.getFilePathForBundle(item);
            if (filePath === null || !fs.existsSync(filePath)) {
                throw Error('Bundle "' + item + '" config file doesn\'t exist.  Path checked: ' + filePath);
                process.exit(0);
            }
            out.push(filePath);
        });

        return out;
    },

    getFilePathForBundle: function (alias) {
        var fileType,
            filePath,
            retVal = null,
            i;
        for (i = 0; i < this.bundleConfigFormats.length; i += 1) {
            fileType = this.bundleConfigFormats[i];
            filePath = path.join(this.bundlesPath, alias + fileType);
            if (fs.existsSync(filePath)) {
                retVal = filePath;
                break;
            }
        }
        return retVal;
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

    // Method is raw and has to be prepped
    loadConfigFile: function (file) {
        if (file.lastIndexOf('.js') === file.length - 3
            || file.lastIndexOf('.json') === file.length - 5) {
            file = require(file);
        }
        else if (file.lastIndexOf('.yaml') === file.length - 5) {
            file = yaml.safeLoad(fs.readFileSync(file));
        }
        return file;
    },

    // @todo idea: make each one in argv._ depend on the next
    launchTasks: function (tasks, gulp) {
        if (sjl.empty(tasks)) {
            console.warn(chalk.yellow('No sub tasks to run from Wrangler.launch tasks.'));
            return;
        }
        // loop through tasks and call gulp.start on each
        tasks.forEach(function (item) {
            // Run task
            gulp.start(item);
        });
    },

    skipLinting: function () {
        var self = this;
        return (self.argv['no-lint']
            || self.argv['skip-lint']
            || self.argv['skip-linting']
            || self.argv['no-hint']
            || self.argv['skip-hint']
            || self.argv['skip-hinting']) || false;
    },

    skipCssLinting: function () {
        var self = this;
        return (self.argv['no-csslint']
            || self.argv['skip-csslint']
            || self.argv['skip-csslinting']
            || self.argv['no-csshint']
            || self.argv['skip-csshint']
            || self.argv['skip-csshinting']) || false;
    },

    skipJsLinting: function () {
        var self = this;
        return (self.argv['no-jslint']
            || self.argv['skip-jslint']
            || self.argv['skip-jslinting']
            || self.argv['no-jshint']
            || self.argv['skip-jshint']
            || self.argv['skip-jshinting']) || false;
    },

    /**
     * Clones an object the dirty way.
     * @param obj
     * @returns {*}
     */
    clone: function (obj) {
        return JSON.parse(JSON.stringify(obj));
    }
});
