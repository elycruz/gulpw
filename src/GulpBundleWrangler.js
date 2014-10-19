/**
 * Created by Ely on 10/4/2014.
 */
require("sjljs");

var Bundle = require("Bundle");

modules.export = sjl.Extendable.extend(function GulpBundleWrangler(config) {

        var defaultOptions = yaml.safeLoad(require("../configs/default.wrangler.config.yaml")),
            taskProxyMap = yaml.safeLoad(require("../configs/default.task.proxy.map.yaml"));

        sjl.extend(true, this, {
            bundles: {},
            cwd: "",
            dirs: {},
            taskProxyMap: taskProxyMap,
            taskStrSeparator: ":",
            tasks: {}
        }, defaultOptions, config);
    },

    {
        init: function (gulp) {
            this.createTaskProxies(gulp)
                .createBundles(gulp);
            return gulp;
        },

        createTaskProxies: function (gulp) {
            var self = this;
            Object.keys(self.tasks).forEach(function (task) {
                self.tasks[task] = self.createTaskProxy(gulp, task);
            });
        },

        createTaskProxy: function (gulp, task) {
            var self = this,
                TaskClass = require(self.taskProxyMap[task]);
            return new TaskClass(gulp);
        },

        createBundles: function (gulp) {
            var self = this;
            (fs.readdirSync(this.dirs.bundles)).forEach(function (item) {
                var bundle = self.createBundle(item);
                self.createTasksForBundle(gulp, bundle);
            });
        },

        createBundle: function (config) {
            var bundle = new Bundle(config);
            this.bundles[bundle.options.name] = bundle;
            return bundle;
        },

        createTasksForBundle: function (gulp, bundle) {
            var self = this;

            // Register bundle with task so that user can call "gulp task-name:bundle-name"
            Object.keys(self.tasks).forEach(function (task) {
                if (!bundle.options.hasOwnProperty(task)) {
                    return;
                }
                self.tasks[task].registerBundle(bundle, gulp, self);
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
        }

    });
