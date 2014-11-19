/**
 * Created by Ely on 10/4/2014.
 */
require("sjljs");

var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    Bundle = require("./../src/Bundle.js");

module.exports = sjl.Extendable.extend(function Wrangler(config) {

        var defaultOptions = yaml.safeLoad(fs.readFileSync("./configs/default.wrangler.config.yaml")),
            taskProxyMap = yaml.safeLoad(fs.readFileSync("./configs/default.task.proxy.map.yaml"));

        sjl.extend(true, this, {
            bundles: {},
            cwd: "",
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
            return self;
        },

        createTaskProxy: function (gulp, task) {
            console.log(task, this.taskProxyMap[task]);
            var self = this,
                src = self.taskProxyMap[task],
                TaskClass = require(src);
            return new TaskClass(gulp);
        },

        createBundles: function (gulp) {
            var self = this,
                bundlesPath = this.bundlesPath;
            (fs.readdirSync(bundlesPath)).forEach(function (fileName) {
                var bundle = self.createBundle(
                    yaml.safeLoad(
                        fs.readFileSync(path.join(bundlesPath, fileName))
                    )
                );
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
