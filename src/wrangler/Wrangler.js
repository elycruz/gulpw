/**
 * Created by Ely on 10/4/2014.
 */

'use strict';

require('sjljs');

require('es6-promise').polyfill();

var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    chalk = require('chalk'),
    // Recursive mkdir (makes all paths in passed path)
    mkdirp = require('mkdirp'),
    Bundle = require(path.join(__dirname, '../bundle/Bundle.js')),
    log;

module.exports = sjl.Extendable.extend(function Wrangler(gulp, argv, env, config) {
    var self = this,
        defaultOptions = self.loadConfigFile(path.join(__dirname, '/../../configs/default.wrangler.config.yaml'));

        log = self.log;

    sjl.extend(true, self, {
        bundles: {},
        cwd: env.configBase,
        argv: argv,
        tasks: {},
        taskKeys: [],
        staticTasks: {},
        staticTaskKeys: [],
        configPath: env.configPath
    }, defaultOptions);

    // Merge local options
    self.mergeLocalOptions(config);

    // Resolve bundles path
    self.bundlesPath = path.join(self.cwd, self.bundlesPath);

    // Store task keys for later
    self.taskKeys = Object.keys(self.tasks);
    self.staticTaskKeys = Object.keys(self.staticTasks);

    // Preparing to give all gulpw components direct access to gulp and wrangler internally.
    self.gulp = gulp;

    // Initialize the pipeline call(s)
    self.init(gulp, self.argv);
},

{
    init: function (gulp, argv) {
        var self = this,
            anyGlobalTasksToRun,
            anyStaticTasksToRun,
            anyPerBundleTasksToRun,
            taskAliasesFromArgv = self.getTaskAliasesFromArgv();

        self.log('Gulp Bundle Wrangler initializing...');

        // Check if we have any global tasks to run
        anyGlobalTasksToRun = argv.all || (argv._.filter(function (item) {
            return item.indexOf(':') === -1;
        })).length > 0;

        anyStaticTasksToRun = self.staticTaskKeys.filter(function (item) {
            return argv._.indexOf(item) > -1;
        }).length > 0;

        anyPerBundleTasksToRun = (argv._.filter(function (item) {
            return item.indexOf(':') > -1;
        })).length > 0;

        // Create static tasks
        if (anyStaticTasksToRun) {
            self.createStaticTaskProxies(gulp);
        }

        // Else create task proxies and bundle(s) if necessary
        else {

            // Create task proxies
            self.createTaskProxies(gulp, taskAliasesFromArgv);

            // If any global tasks to run create tasks proxies and all bundles.
            if (anyGlobalTasksToRun && !anyPerBundleTasksToRun) {
                self.log('\nGlobal tasks found and no Per-Bundle tasks found.', '\n', 'Preparing global tasks.', '--debug');
                self.createBundles(gulp, null, false);
                self.registerGlobalTasks(gulp, taskAliasesFromArgv);
            }
            else if (anyGlobalTasksToRun && anyPerBundleTasksToRun) {
                self.log('\nGlobal tasks found and Per-Bundle tasks found.', '\n', 'Preparing global and per-bundle tasks.', '--debug');
                self.createBundles(gulp, null, false);
                self.registerGlobalTasks(gulp, taskAliasesFromArgv);
            }
            else if (anyPerBundleTasksToRun && !anyGlobalTasksToRun) {
                self.log('\nNo global tasks found but found Per-Bundle tasks.', '\n', 'Preparing per-bundle tasks.', '--debug');
                self.createBundles(gulp, self.extractBundlePathsFromArgv(argv), true);
            }
        }

        self.launchTasks(argv._, gulp);
    },

    createStaticTaskProxies: function (gulp) {
        var self = this;

        // Creating task proxies message
        self.log('- Creating static task proxies.');

        self.staticTaskKeys.forEach(function (task) {
            self.staticTasks[task].instance = self.createStaticTaskAdapter(gulp, task);
        });

        return self;
    },

    createTaskProxies: function (gulp, taskKeys) {
        var self = this,
            taskKeys = taskKeys || self.getTaskAliasesFromArgv();

        // Creating task proxies message
        self.log(chalk.cyan('\n- Creating task proxies.'));

        taskKeys.forEach(function (task) {
            if (sjl.classOfIs(self.tasks[task], 'String')) {
                self.tasks[task] = self.loadConfigFile(path.join(process.cwd(), self.tasks[task]));
            }
            self.tasks[task].instance = self.createTaskAdapter(gulp, task);
        });

        return self;
    },

    createTaskAdapter: function (gulp, task) {

        // 'Creating task ...' message
        this.log(' - Creating task adapter \"' + task + '\'.');

        var self = this,
            src = self.tasks[task].constructorLocation,
            TaskAdapterClass = require(path.join(__dirname, '../', src)),
            options = self.tasks[task];

        options.alias = task;
        options.help = self.tasks[task].help;

        return new TaskAdapterClass(options, gulp, this);
    },

    createStaticTaskAdapter: function (gulp, task) {
        // 'Creating task ...' message
        this.log(chalk.cyan('\n- Creating static task adapter \"' + task + '\'.'));

        var self = this,
            src = self.staticTasks[task].constructorLocation,
            TaskAdapterClass = require(path.join(__dirname, src));

        TaskAdapterClass = new TaskAdapterClass({
            name: task,
            help: self.staticTasks[task].help || ''
        });

        TaskAdapterClass.registerStaticTasks(gulp, self);

        return TaskAdapterClass;
    },

    createBundles: function (gulp, bundles, registerBundles) {
        registerBundles = sjl.isset(registerBundles) ? registerBundles : true;
        var self = this;

        // Creating task proxies message
        self.log(chalk.cyan('\n- Creating bundles.'));

        // Create bundles if necessary
        if (!sjl.isset(bundles)) {
            bundles = fs.readdirSync(self.bundlesPath).map(function (fileName) {
                return self.createBundle(path.join(self.bundlesPath, fileName));
            });
        }
        // Else expect an array of file paths
        else {
            bundles = bundles.map(function (bundle) {
                return self.createBundle(bundle);
            });
        }

        // Register bundles with tasks if necessary
        if (registerBundles) {
            self.registerBundles(gulp, bundles);
        }

        return self;
    },

    createBundle: function (config) {
        var filePath = config, //path.relative(process.cwd(), config),
            bundle,
            bundleAlias;

        // If config is of type 'String' we assume a path
        if (sjl.classOfIs(config, 'String')) {
            bundleAlias = config + "";
            config = this.loadConfigFile(config);
            config.alias = path.basename(bundleAlias).split(/\.(yaml|js|json)$/)[0];
        }

        // If no config passed throw an Error
        if (sjl.empty(config)) {
            throw new Error('A valid configuration object or file location is ' +
                'expected in/for `Wrangler.createBundle`.');
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

    registerBundles: function (gulp, bundles, taskKeys) {
        var self = this;
        bundles.forEach(function (bundle) {
            self.registerTasksForBundle(gulp, bundle, taskKeys);
        });
    },

    registerTasksForBundle: function (gulp, bundle, taskKeys) {
        var self = this;
            taskKeys = taskKeys || self.getTaskAliasesFromArgv();

        // Register bundle with task
        taskKeys.forEach(function (task) {
            self.registerBundleWithTask(bundle, task);
        });
    },

    registerBundleWithTask: function (bundle, task) {
        var self = this;
        bundle = self.getBundleAlias(bundle);
        task = self.getTaskAdapterAlias(task);
        if (!self.isTaskRegistered(bundle + ':' + task)) {
            self.getTaskAdapter(task).registerBundle(self.bundles[bundle], self.gulp, self);
            self.log(' ~ Bundle "' + bundle + '" registered with task "' + task + '".');
        }
        return self;
    },

    registerGlobalTasks: function (gulp, tasks) {
        var self = this,
            bundles = Object.keys(self.bundles).map(function (key) {
                return self.bundles[key];
            });

        // Pass all bundles to each task
        tasks.forEach(function (task) {
            if (task.indexOf(':') > -1 || self.staticTaskKeys.indexOf(task) > -1) {
                return;
            }
            self.log(chalk.cyan('Registering bundles for task "' + task + '".'));
            self.tasks[task].instance.registerBundles(bundles, gulp, self);

        });
    },

    isTaskRegistered: function (taskName) {
        return sjl.isset(this.gulp.tasks[taskName]);
    },

    getTaskAliasesFromArgv: function () {
        var self = this;
        if (!sjl.isset(self.taskAliasesFromArgv)) {
            self.taskAliasesFromArgv = self.getTaskAliasesFromArray(self.argv._);
        }
        return self.taskAliasesFromArgv;
    },

    getTaskAliasesFromArray: function (list) {
        var out  = [];
        list = list || this.argv._;
        list.forEach(function (arg) {
            out.push(arg.indexOf(':') ? arg.split(':')[0] : arg);
        });
        return out;
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
        var self = this;
        return (new Promise(function (fulfill, reject) {
            var intervalSpeed = 100,
                completedTasks,
                completionInterval = null,
                taskList;

            if (sjl.empty(tasks)) {
                reject();
                log('`Wrangler.prototype.launchTasks` recieved an empty tasks list.');
                return;
            }

            // loop through tasks and call gulp.start on each
            tasks.forEach(function (item) {
                // Run task
                try {
                    self.log(chalk.grey(' Launching task "' + item + '".'));
                    gulp.start(item);
                }
                catch (e) {
                    self.log(e, '--mandatory');
                    reject();
                }
            });

            completionInterval = setInterval(function () {
                completedTasks = tasks.filter(function (key) {
                    return sjl.isset(gulp.tasks[key]) && gulp.tasks[key].done && gulp.tasks[key].done === true;
                });

                if (completedTasks.length === tasks.length) {
                    fulfill();
                    taskList = tasks.map(function (key) { return '\n - `' + key + '`'; }).join('');
                    clearInterval(completionInterval);
                }

            }, intervalSpeed);

        })); // end of promise
    },

    skipTesting: function () {
        return this.argv.skipTests;
    },

    skipMochaTesting: function () {
        return this.argv.skipMochaTests;
    },

    skipJasmineTesting: function () {
        return this.argv.skipJasmineTests;
    },

    skipLinting: function () {
        return this.argv.skipLinting;
    },

    skipCssLinting: function () {
        return this.argv.skipCsslinting;
    },

    skipJsLinting: function () {
        return this.argv.skipJsLinting;
    },

    clone: function (obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    mergeLocalOptions: function (options) {
        var self = this,
            tasks;

        // Bail if empty options
        if (sjl.empty(options)) {
            return this;
        }

        // Merge directly if no `tasks` in options
        if (!options.tasks) {
            sjl.extend(true, self, options);
            return;
        }

        // Store options tasks value
        tasks = options.tasks;

        // Remove tasks value from options
        options.tasks = undefined;
        delete options.tasks;

        // Extend self with options
        sjl.extend(true, self, options);

        // Copy task configs from copied tasks obj
        Object.keys(tasks).forEach(function (key) {
            var value = tasks[key],

                // If task config is a string assume a path
                objToMerge = sjl.classOfIs(value, 'String')
                    ? self.loadConfigFile(path.join(process.cwd(), value)) : value;

            // If task cofnig is an object extend it
            if (sjl.isset(self.tasks[key]) && sjl.classOfIs(self.tasks[key]), 'Object') {
                sjl.extend(true, self.tasks[key], objToMerge)
            }
            // Else set it
            else {
                self.tasks[key] = objToMerge;
            }
        });
    },

    getBundle: function (bundle) {
        var self = this,
            originalBundleValue = bundle,
            i, item;

        bundle = this.bundles[this.getBundleAlias(bundle)];

        if (!sjl.isset(bundle)) {
            // Try to create bundle
            for (i = 0; i < self.bundleConfigFormats.length; i += 1) {
                try {
                    bundle = self.createBundle(
                        self.loadConfigFile(
                            path.join(self.bundlesPath, originalBundleValue + self.bundleConfigFormats)));
                    break;
                }
                catch (e) {}
            }
            if (sjl.empty(bundle)) {
                bundle = null;
            }
        }

        return bundle;
    },

    getBundleAlias: function (bundle) {
        return bundle instanceof Bundle ? bundle.options.alias :
            (sjl.classOfIs(bundle, 'Object') ? bundle.alias : bundle);
    },

    hasBundle: function (bundle) {
        return sjl.isset(this.bundles[this.getBundleAlias(bundle)]);
    },

    getTaskAdapter: function (taskAdapter) {
        var taskAdapterAlias = this.getTaskAdapterAlias(taskAdapter),
            instance = this.tasks[taskAdapterAlias] ?  this.tasks[taskAdapterAlias].instance : null;
        if (!sjl.isset(instance)) {
            instance = this.createTaskAdapter(this.gulp, taskAdapterAlias);
            this.tasks[taskAdapterAlias].instance = instance;
        }
        return instance;
    },

    getTaskAdapterAlias: function (taskAdapter) {
        return sjl.classOfIs(taskAdapter, 'Object') ? taskAdapter.alias : taskAdapter;
    },
    
    hasTaskAdapter: function (taskAdapter) {
        taskAdapter = this.getTaskAdapterAlias(taskAdapter);
        return sjl.isset(this.tasks[taskAdapter]);
    },

    getArgvFileTypes: function () {
        if (!sjl.isset(this.argvFileTypes)) {
            this.argvFileTypes = this.argv.fileTypes ? this.argv.fileTypes.split(',') : [];
        }
        return this.argvFileTypes;
    },

    hasArgvFileTypes: function () {
        return !sjl.empty(this.getArgvFileTypes());
    }
});
