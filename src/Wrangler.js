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
    os = require('os');

module.exports = sjl.Extendable.extend(function Wrangler(gulp, argv, env, config) {
    var self = this,
        defaultOptions = self.loadConfigFile(path.join(env.pwd, '/configs/wrangler.config.yaml'));

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

        // Insert a new line at the top of our ouptput to have a cleaner look
        console.log('');

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

    /**
     * Create task adapters for passed in keys
     * @param gulp {gulp}
     * @param taskKeys {Array}
     * @returns {Wrangler}
     */
    createTaskAdapters: function (gulp, taskKeys) {
        var self = this;

        taskKeys = taskKeys || self.getTaskAliasesFromArgv();

        // Creating task adapters message
        self.log(chalk.cyan('\n- Creating task adapters.'));

        taskKeys.forEach(function (task) {
            if (sjl.classOfIs(self.tasks[task], 'String')) {
                // If file is unloadable throw an error
                if (!fs.existsSync(self.tasks[task])) {
                    throw new Error('Wrangler.createTaskAdapters encountered a string for ' +
                        'a task value but could not find a loadable file for it.' +
                        'Path attempted to load: ' + self.tasks[task]);
                }
                // Load config file
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
            localConstructor = self.staticTasks[task].hasOwnProperty('localConstructor') ?  self.staticTasks[task].localConstructor : null,
            src = localConstructor ? path.join(self.cwd, localConstructor) :
                path.join(self.pwd, self.staticTasks[task].constructorLocation),
            TaskAdapterClass = require(src);

        TaskAdapterClass = new TaskAdapterClass(sjl.extend({
            alias: task,
            help: self.staticTasks[task].help || ''
        }, self.clone(self.staticTasks[task])));

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

        self.log('');

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
            self.log('\n', chalk.grey('Preparing to register bundle "' + bundle.options.alias + '".'), '\n');
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
        var self = this,
            taskAdapter = self.getTaskAdapter(task);
        bundle = self.getBundleAlias(bundle);
        task = self.getTaskAdapterAlias(task);
        if (!self.isTaskRegistered(task + ':' + bundle)
            && taskAdapter.isBundleValidForTask(self.bundles[bundle])) {
            // Register bundle with task and capture registration result
            taskAdapter.registerBundle(self.bundles[bundle], self.gulp, self);
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
            self.log(chalk.cyan('Registering bundles for task "' + task + '".'), '--debug');
            self.tasks[task].instance.registerBundles(bundles, gulp, self);
        });
    },

    isTaskRegistered: function (taskName) {
        return this.gulp.tasks.hasOwnProperty(taskName) && !sjl.empty(this.gulp.tasks[taskName]);
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
        var out = {taskAlias: command, bundleAlias: null, params: null},
            args;
        if (command.indexOf(':')) {
            args = command.split(':');
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

    /**
     * Loads a wrangler configuration file (which is simply a *.json, *.js, or *.yaml file).
     * @param file {String} - File path.
     * @returns {Object|*} - Returns the loaded returned value of loading `file` or file path
     *  if it does not match one of the allowed file types [json,js,yaml].
     */
    loadConfigFile: function (file) {
        if (file.lastIndexOf('.js') === file.length - 3
            || file.lastIndexOf('.json') === file.length - 5) {
            file = require(file);
        }
        else if (file.lastIndexOf('.yaml') === file.length - 5
            || file.lastIndexOf('.yml') === file.length - 4) {
            file = yaml.safeLoad(fs.readFileSync(file));
        }
        return file;
    },

    /**
     * Writes a configuration file depending on file extension in the `filePath` parameter.
     * @param obj {Object} - Object to convert to file.
     * @param filePath {String} - File path to write `obj` to.
     * @returns {exports}
     */
    writeConfigFile: function (obj, filePath) {
        if (filePath.lastIndexOf('.json') === filePath.length - 5) {
            obj = JSON.stringify(obj, '    ');
        }
        else if (filePath.lastIndexOf('.yaml') === filePath.length - 5
            || filePath.lastIndexOf('.yml') === filePath.length - 4) {
            obj = yaml.safeDump(obj);
        }
        else if (filePath.lastIndexOf('.js') === filePath.length - 3) {
            obj = '\'use strict\'; module.exports = ' + JSON.stringify(obj, '    ') + ';';
        }
        //this.backupConfigFile(filePath);
        fs.writeFileSync(filePath, obj);
        return this;
    },

    /**
     * Backs up a config file to `wrangler.localConfigBackupPath` if the file exists.
     * @param filePath
     * @returns {exports}
     */
    backupConfigFile: function (filePath) {
        var self = this;
        if (fs.existsSync(filePath)) {
            self.ensurePathExists(path.dirname(filePath));
            fs.writeFileSync(fs.readFileSync(filePath), path.join(self.cwd, self.localConfigBackupPath));
        }
        return self;
    },

    launchTasks: function (tasks, gulp) {
        var self = this;

        self.log ('gulp tasks: \n', gulp.tasks, '--debug');

        if (sjl.empty(tasks)) {
            self.log('No tasks to run found.', '--mandatory');
            return Promise.reject('`Wrangler.prototype.launchTasks` recieved an empty tasks list.');
        }

        // Ensure only registered tasks get run
        tasks = tasks.filter(function (item) {
            var retVal;
            if (self.isTaskRegistered(item)) {
                retVal = true;
            }
            else {
                self.log(chalk.yellow('! Could not run the task "' + item + '".  ' +
                'Task not defined.'), '--mandatory');
                retVal = false;
            }
            return retVal;
        });

        return (new Promise(function (fulfill, reject) {
            var intervalSpeed = 100,
                completedTasks,
                completionInterval = null;

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
                    //taskList = tasks.map(function (key) { return '\n - `' + key + '`'; }).join('');
                    clearInterval(completionInterval);
                }

            }, intervalSpeed);

        })); // end of promise
    },

    launchTasksSync: function (tasks, gulp) {
        var self = this,
            lastPriority,
            priorityList = [];

        // If only one task launch it and exit function
        if (tasks.length === 1) {
            return self.launchTasks(tasks, gulp);
        }

        // Get task list data objects (sorted)
        tasks = self.sortTaskKeysByPriority(self.getTaskListToTaskDataObjs(tasks), 1);

        // Create priority list to reduce
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

        // If no priority list then bail
        if (priorityList.length === 0) {
            return Promise.resolve();
        }

        // Debug message
        self.log('Priority list: \n', priorityList, '--debug');

        priorityList.reduce(function (item1, item2, i, list) {
            item1 = list[i-1];

            if (!item2) {
                return;
            }

            var deps1 = self.onlyDefinedTaskAliases(gulp.tasks[item1[0]].dep || []),
                deps2 = self.onlyDefinedTaskAliases(item2);

            if (deps1.length > 0) {
                gulp.tasks[item1[0]].dep = deps1;
            }

            if (deps2.length > 0) {
                gulp.tasks[item1[0]].dep = (gulp.tasks[item1[0]].dep || []).concat(deps2);
            }

            // Debug message
            self.log('items:', item1, item2, i, '--debug');

            return item1;
        });

        return self.launchTasks(priorityList[0], gulp);
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
        options.tasks = null;
        delete options.tasks;

        // Extend self with options
        sjl.extend(true, self, options);

        userTaskKeys = Object.keys(tasks) || [];

        // Add user task keys to stored default keys
        self.taskKeys = self.taskKeys.concat(Object.keys(userTaskKeys));
        self.staticTaskKeys = options.staticTasks ?
            self.staticTaskKeys.concat(Object.keys(options.staticTasks)) : self.staticTaskKeys;

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
                objToMerge = value;

            // Attempt to load file if `value` is a string
            if (sjl.classOfIs(value, 'String')) {
                // If file is unloadable warn the user about unloadable file path
                if (!fs.existsSync(value)) {
                    /*throw new Error*/
                    //console.warn(chalk.yellow('\n!`Wrangler.mergeLocalOptions` encountered a string for ' +
                    //    'a task value but could not find a loadable config file for it.' +
                    //    '  Path attempted to load: ' + value +
                    //    '  Task key "' + key + '" will not be merged in from the' +
                    //    ' user\'s gulpw-config.* file.'));
                    objToMerge = null;
                }
                // load file
                else {
                    objToMerge = self.loadConfigFile(path.join(process.cwd(), value));
                }
            }

            // If task config is an object extend it
            if (sjl.isset(self.tasks[key]) && sjl.classOfIs(self.tasks[key], 'Object')
            && sjl.classOfIs(objToMerge, 'Object')) {
                sjl.extend(true, self.tasks[key], objToMerge);
            }
            // Else set it
            else if (objToMerge !== null) {
                self.tasks[key] = objToMerge;
            }
        });
    },

    onlyDefinedTaskAliases: function (aliases) {
        var self = this;
        return aliases.filter(function (item) {
            return self.isTaskRegistered(item);
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
                bundle = self.createBundle(
                    self.loadConfigFile(
                        path.join(self.bundlesPath, originalBundleValue + self.bundleConfigFormats)));
                break;
            }
            if (sjl.empty(bundle)) {
                bundle = null;
            }
        }

        return bundle;
    },

    getBundleAlias: function (bundle) {
        var retVal = bundle;
        if (bundle instanceof Bundle) {
            retVal = bundle.options.alias;
        }
        else if (sjl.classOfIs(bundle, 'Object')) {
            retVal = bundle.alias;
        }
        return retVal;
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
    },

    /**
     * Clones some options from wrangler based on key and extends those options with your passed in object.
     * @param key {String} - String / Namespace string ('some.path.within.an.object')
     * @param extendWithObj {Object|*} - Optional.  Only gets merged with the key in wrangler if this variable is an `Object`.
     * @returns {*}
     */
    extendWranglerOptions: function (key, extendWithObj) {
        var options = sjl.namespace(key, this),
            classOfOptions = sjl.classOf(options),
            classOfObj = sjl.classOf(extendWithObj),
            retVal = null;
        if (sjl.empty(options) && !sjl.empty(extendWithObj)) {
            retVal = extendWithObj;
        }
        else if (!sjl.empty(options) && sjl.empty(extendWithObj)) {
            retVal = options;
        }
        else if (!sjl.empty(options) && !sjl.empty(extendWithObj) &&
            classOfOptions === 'Object' && classOfObj === 'Object') {
            retVal = sjl.extend(true, this.clone(options), extendWithObj);
        }
        return retVal;
    }

});
