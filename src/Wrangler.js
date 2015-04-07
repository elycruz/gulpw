/**
 * Created by Ely on 10/4/2014.
 */

'use strict';

require('sjljs');

var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    chalk = require('chalk'),
    mkdirp = require('mkdirp'),
    glob = require('glob'),
    Bundle = require('./Bundle'),
    log,
    os = require('os');

module.exports = sjl.Extendable.extend(function Wrangler(gulp, argv, env, config) {
    var self = this,
        defaultOptions = self.loadConfigFile(path.join(env.pwd, '/configs/wrangler.config.yaml'));

        log = self.log;

    sjl.extend(true, self, {
        bundles: {},
        cwd: env.configBase,
        pwd: env.pwd,
        argv: argv,
        tasks: defaultOptions.tasks,
        taskKeys: Object.keys(defaultOptions.tasks),
        staticTasks: defaultOptions.staticTasks,
        staticTaskKeys: Object.keys(defaultOptions.staticTasks),
        configPath: env.configPath
    }, defaultOptions);

    // Merge local options
    self.mergeLocalOptions(config);

    // Resolve bundles path
    self.bundlesPath = path.join(self.cwd, self.bundlesPath);

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
            self.createStaticTaskAdapters(gulp, taskAliasesFromArgv);
        }

        // Else create task proxies and bundle(s) if necessary
        else {

            // Create task adapters
            self.createTaskAdapters(gulp, taskAliasesFromArgv);

            // If any global tasks to run create tasks adapters and all bundles.
            if (anyGlobalTasksToRun && !anyPerBundleTasksToRun) {
                self.log('\nGlobal tasks found and no Per-Bundle tasks found.', '\n', 'Preparing global tasks.', '--debug');
                self.createBundles(gulp, null, false);
                self.registerGlobalTasks(gulp, taskAliasesFromArgv);
            }
            else if (anyGlobalTasksToRun && anyPerBundleTasksToRun) {
                self.log('\nGlobal tasks found and Per-Bundle tasks found.', '\n', 'Preparing global and per-bundle tasks.', '--debug');
                self.createBundles(gulp, null, false);
                self.registerGlobalTasks(gulp, taskAliasesFromArgv);
                self.registerBundles(gulp, self.bundles, taskAliasesFromArgv);
            }
            else if (anyPerBundleTasksToRun && !anyGlobalTasksToRun) {
                self.log('\nNo global tasks found but found Per-Bundle tasks.', '\n', 'Preparing per-bundle tasks.', '--debug');
                self.createBundles(gulp, self.extractBundlePathsFromArgv(argv), true);
            }
        }

        self.launchTasks(argv._, gulp);
    },

    createStaticTaskAdapters: function (gulp, taskAliases) {
        var self = this;

        // Creating task adapters message
        self.log('- Creating static task adapters.');

        taskAliases.forEach(function (task) {
            if (sjl.isset(self.staticTasks[task])) {
                self.staticTasks[task].instance = self.createStaticTaskAdapter(gulp, task);
            }
        });

        return self;
    },

    createTaskAdapters: function (gulp, taskKeys) {
        var self = this;

        taskKeys = taskKeys || self.getTaskAliasesFromArgv();

        // Creating task adapters message
        self.log(chalk.cyan('\n- Creating task adapters.'));

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
            localConstructor = self.tasks[task].hasOwnProperty('localConstructor') ?  self.tasks[task].localConstructor : null,
            src = localConstructor ? path.join(self.cwd, localConstructor) :
                path.join(self.pwd, self.tasks[task].constructorLocation),
            TaskAdapterClass = require(src),
            options = self.tasks[task];

        options.alias = task;

        return new TaskAdapterClass(options, gulp, this);
    },

    createStaticTaskAdapter: function (gulp, task) {
        // 'Creating task ...' message
        this.log(chalk.cyan('\n- Creating static task adapter \"' + task + '\'.'));

        var self = this,
            src = self.staticTasks[task].constructorLocation,
            TaskAdapterClass = require(src);

        TaskAdapterClass = new TaskAdapterClass({
            alias: task,
            help: self.staticTasks[task].help || ''
        });

        TaskAdapterClass.registerStaticTask(gulp, self);

        return TaskAdapterClass;
    },

    createBundles: function (gulp, bundles, registerBundles) {
        registerBundles = sjl.isset(registerBundles) ? registerBundles : true;
        var self = this;

        // Creating task adapters message
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
            bundleAlias = config + '';
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
        var self = this,
            _bundles = [];
        gulp = gulp || this.gulp;
        if (!Array.isArray(bundles)) {
            Object.keys(bundles).forEach(function (item) {
                _bundles.push(item);
            });
        }
        else {
            _bundles = bundles;
        }
        _bundles.forEach(function (bundle) {
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
        if (!self.isTaskRegistered(task + ':' + bundle)) {
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

    splitWranglerCommand: function (command) {
        var out = {taskAlias: command, bundleAlias: null, params: null};
        if (command.indexOf(':')) {
            var args = command.split(':');
            out = {taskAlias: args[0], bundleAlias: args[1], params: args.length > 2 ? args.splice(2) : null};
        }
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
        //
        //tasks = self.sortTaskKeysByPriority(self.getTaskListToTaskDataObjs(tasks), 0)
        //    .map(function (obj) {
        //            return obj.command;
        //        });

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
                    self.log(chalk.grey('- Launching gulp task "' + item + '".'), '--debug');
                    gulp.start(item);
                }
                catch (e) {
                    self.log(chalk.red('`Wrangler.launchTasks` encountered the following error:\n'),
                        chalk.grey(e.message), chalk.grey(e.lineNumber), chalk.grey(e.stack), '--mandatory');
                    reject('`Wrangler.launchTasks` encountered the following error:' + e);
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

    launchTasksSync: function (tasks, gulp) {
        var self = this,
            lastPriority,
            lastPromise,
            priorityList = [];

        tasks = self.sortTaskKeysByPriority(self.getTaskListToTaskDataObjs(tasks), 0);

        tasks.forEach(function (task) {
            if (!sjl.isset(lastPriority)) {
                lastPriority = task.priority;
                priorityList.push([task.command]);
            }
            else if (lastPriority !== task.priority) {
                priorityList.push([task.command]);
            }
            else if (priorityList[priorityList.length-1].indexOf(task.command) === -1) {
                priorityList[priorityList.length-1].push(task.command);
            }
            lastPriority = task.priority;
        });

        priorityList.reduce(function (val1, val2, index, list) {
            if (Array.isArray(val1)) {
                lastPromise = self.launchTasks(val1, gulp);
            }
            else {
                lastPromise = val1;
            }

            if (Array.isArray(val2)) {
                lastPromise = lastPromise.then(function () {
                    return self.launchTasks(val2, gulp);
                });
            }

            return lastPromise;
        });

        return lastPromise;
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
            tasks,
            userTaskKeys;

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

        userTaskKeys = Object.keys(tasks) || [];

        // Add user task keys to stored default keys
        self.taskKeys = self.taskKeys.concat(Object.keys(userTaskKeys));
        self.staticTaskKeys = options.staticTasks ? Object.keys(options.staticTasks) : self.staticTaskKeys;

        // Set 'notConfigured' value to be used by 'register*' task adapter functions.
        self.taskKeys.forEach(function (key) {
            if (sjl.empty(tasks[key]) && !sjl.empty(self.tasks[key])) {
                self.tasks[key].notConfiguredByUser = true;
            }
        });

        // Copy task configs from copied tasks obj
        userTaskKeys.forEach(function (key) {
            var value = tasks[key],

                // If task config is a string assume a path
                objToMerge = sjl.classOfIs(value, 'String')
                    ? self.loadConfigFile(path.join(process.cwd(), value)) : value;

            // If task config is an object extend it
            if (sjl.isset(self.tasks[key]) && sjl.classOfIs(self.tasks[key]), 'Object') {
                sjl.extend(true, self.tasks[key], objToMerge);
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
            i;

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
    },

    pathToForwardSlashes: function (filePath, checkForWindows) {
        if (!sjl.empty(checkForWindows)) {
            filePath = os.type().toLowerCase().indexOf('windows') > -1 ? filePath.replace(/\\/g, '/') : filePath;
        }
        else {
            filePath = filePath.replace(/\\/g, '/');
        }
        return filePath;
    },

    sortTaskKeysByPriority: function (tasksSortDataObjs, direction) {
        var self = this,
            asc = 1,
            desc = 0;
            direction = sjl.isset(direction) ? direction : asc;
        return tasksSortDataObjs.sort(function (obj1, obj2) {
            if (!self.tasks[obj1.taskAlias] || !self.tasks[obj2.taskAlias]) {
                return 0;
            }
            var value1 = parseInt(self.tasks[obj1.taskAlias].priority, 10),
                value2 = parseInt(self.tasks[obj2.taskAlias].priority, 10),
                retVal = 0;
            if (direction === desc && value1 < value2) {
                retVal = 1;
            }
            else if (direction === desc && value1 > value2) {
                retVal = -1;
            }
            else if (direction === asc && value1 > value2) {
                retVal = 1;
            }
            else if (direction === asc && value1 < value2) {
                retVal = -1;
            }
            return retVal;
        });
    },

    getTaskPriority: function (key) {
        if (key.indexOf(':') !== -1) {
            key = this.splitWranglerCommand(key).taskAlias;
        }
        return parseInt(this.tasks[key].hasOwnProperty('priority') ? this.tasks[key].priority : 0, 10);
    },

    getTaskSortData: function (command) {
        var retVal = command,
            topLevelTaskAlias = this.splitWranglerCommand(command).taskAlias;
        if (sjl.classOfIs(command, 'String')) {
            retVal = {
                command: command,
                priority: this.getTaskPriority(topLevelTaskAlias),
                taskAlias: topLevelTaskAlias
            };
        }
        return retVal;
    },

    getTaskListToTaskDataObjs: function (list) {
        var self = this;
        return list.map(function (item) {
            return self.getTaskSortData(item);
        });
    },

    /**
     * Returns the files located at glob string or the string passed in if it doesn't contain glob magic.
     * @param string {String} - Glob string to parse.
     * @returns {Array|String} - See description above.
     */
    explodeGlob: function (string) {
        var out = string;
        if (glob.hasMagic(string)) {
            out = glob.sync(string);
        }
        return out;
    },

    /**
     * Explodes any globs in an array of file paths and replaces the glob entries with actual file paths.
     * @param fileList {Array} - Array of file paths.
     * @returns {Array} - Array of file paths with globs replaced by actual file entries.
     */
    explodeGlobs: function (fileList) {
        var self = this,
            out = [];
        fileList.forEach(function (file) {
            var value = self.explodeGlob(file);
            if (Array.isArray(value)) {
                out = out.concat(value);
            }
            else {
                out.push(value);
            }
        });
        return out;
    }

});
