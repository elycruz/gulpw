/**
 * Created by Ely on 10/4/2014.
 */
require("sjljs");

var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    Bundle = require("./../src/Bundle.js"),
    exec = require('child_process').exec,
    log = function () {
        var args = sjl.argsToArray(arguments),
            verbose = sjl.extractBoolFromArrayEnd(args);
        if (verbose) {
            console.log.apply(console, args);
        }
    },

    throwBundleFileNotExistError = function (bundleName, filePath) {
        throw Error('Bundle "' + bundleName + '" config file doesn\'t exist.  Path checked: ' + filePath);
    };

module.exports = sjl.Extendable.extend(function Wrangler(gulp, argv, env, config) {
        var defaultOptions = yaml.safeLoad(fs.readFileSync(
                path.join(__dirname, "/../configs/default.wrangler.config.yaml"))),
            taskProxyMap = yaml.safeLoad(fs.readFileSync(
                path.join(__dirname, "/../configs/default.task.proxy.map.yaml")));

        log(argv, true);

        sjl.extend(true, this, {
            bundles: {},
            cwd: env.configBase,
            argv: argv,
            taskProxyMap: taskProxyMap,
            taskStrSeparator: ":",
            tasks: {}
        }, defaultOptions, config);

        // Resolve bundles path
        this.bundlesPath = path.join(this.cwd, this.bundlesPath);
        this.init(gulp, this.argv);
    },

    {
        init: function (gulp, argv) {
            log("Gulp Bundle Wrangler initializing...", argv.verbose);

            // Check if we have any global tasks to run
            var anyGlobalTasksToRun = argv.all || (argv._.filter(function (item) {
                return item.indexOf(':') === -1;
            })).length > 0;

            // Create task proxies (@todo in the future only load needed tasks if it makes any difference in performance)
            this.createTaskProxies(gulp);

            // If any global tasks to run create tasks proxies and register all bundles.
            if (anyGlobalTasksToRun) {
                this.createBundles(gulp);
            }

            // No global tasks to run (tasks on all modules) so register only passed in bundle(s)
            else {
                this.createBundles(gulp, this.extractBundlePathsFromArgv(this.argv));
            }

            // Run tasks
            exec('1 + 1', function (err, stdOut, stdError)


            return gulp;
        },

        createTaskProxies: function (gulp) {
            // Creating task proxies message
            log("- Creating task proxies.", this.argv.verbose);
            var self = this;
            Object.keys(self.tasks).forEach(function (task) {
                self.tasks[task].instance = self.createTaskProxy(gulp, task);
            });
            return self;
        },

        createTaskProxy: function (gulp, task) {
            // "Creating task ..." message
            log("Creating task proxy \"" + task + "\".  constructor at: \"" +
            this.taskProxyMap[task].constructorLocation + "\"", this.argv.verbose);

            var self = this,
                src = self.taskProxyMap[task].constructorLocation,
                TaskClass = require(src);

            return new TaskClass(gulp);
        },

        createBundles: function (gulp, bundles) {
            // Creating task proxies message
            log("- Creating bundles.", this.argv.verbose);
            var self = this,
                bundlesPath = this.bundlesPath,
                usingFsFileStrings = false;

            // Get bundles
            if (!bundles) {
                bundles = (fs.readdirSync(bundlesPath));
                usingFsFileStrings = true;
            }

            // Parse bundle configs
            bundles.forEach(function (fileName) {
                var bundle = self.createBundle(fileName);
                self.createTasksForBundle(gulp, bundle);
            });
        },

        createBundle: function (config) {

            if (sjl.classOfIs(config, 'String')) {
                config = this.getBundleConfigByName(config);
            }

            //
            if (sjl.empty(config)) {
                return; // @todo throw exception here
            }

            // "Creating task ..." message
            log('Creating bundle "' + config.name + '"', this.argv.verbose);

            var bundle = new Bundle(config);

            log(bundle, true);

            // Created message
            log('"' + bundle.options.name + '" created successfully.', this.argv.verbose);

            // Store bundle
            this.bundles[bundle.options.name] = bundle;

            // Return bundle
            return bundle;
        },

        createTasksForBundle: function (gulp, bundle) {
            var self = this;
            log(bundle, true);

            // Register bundle with task so that user can call "gulp task-name:bundle-name"
            Object.keys(self.tasks).forEach(function (task) {
                if (!bundle.options.hasOwnProperty(task.name)) {
                    return;
                }
                self.tasks[task].instance.registerBundle(bundle, gulp, self);
            });
        },

        getDirSafe: function (dir) {
            var found = sjl.namespace(dir, this.dirs);
            return sjl.classOfIs(found, 'String') ? found + '/' : '';
        },

        getTaskStrSeparator: function () {
            var self = this,
                separator = self.taskStrSeparator;
            // Return the separator
            return sjl.classOfIs(separator, 'String') && separator.length > 0
                ? separator : self.defaultTaskStrSeparator;
        },

        getBundleConfigByName: function (name) {
            var filePath = name.indexOf(path.sep) > -1 || name.indexOf('/') > -1 ? name : process.sepapath.join(this.bundlesPath, name + '.' + this.bundleConfigFormat),
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
                return /[a-z\d\-_]+\:[a-z\d\-_]+/i.test(item);
            }).forEach(function (item) {
                parts = item.split(':');
                extracted.push(parts[parts.length - 1]);
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
        }



    });
