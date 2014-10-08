/**
 * Created by Ely on 10/4/2014.
 */
require('sjljs');

var Bundle = require('Bundle');

modules.export = sjl.Extendable.extend(function GulpBundleWrangler (config) {
    var taskProxyMap = yaml.load(require('task-proxy-map.yaml')),
        defaultConfig = {
            tasks: {},
            dirs: {},
            bundles: {},
            taskProxyMap: taskProxyMap
        };

    sjl.extend(true, this, defaultConfig, config);

}, {

    init: function (gulp) {
        this.createTaskProxyObjects(gulp)
            .createBundleObjects(gulp);
        console.log(this.taskProxyMap);
        return gulp;
    },

    createTaskProxyObjects: function (gulp) {
        var self = this;
        Object.keys(self.tasks).forEach(function (task) {
            var TaskClass = require(self.taskProxyMap[task]);
            self.tasks[task] = new TaskClass(gulp);
        });
    },

    createBundleObjects: function (gulp) {
        var self = this;
        (fs.readdirSync(this.dirs.bundles)).forEach(function (item) {
            var bundle = self.addBundleFromConfig(item);
            self.createTasksForBundle(gulp, bundle);
        });
    },

    addBundleFromConfig: function (config) {
        var bundle = new Bundle(config);
        this.bundles[bundle.name] = bundle;
        return bundle;
    },

    createTasksForBundle: function (gulp, bundle) {
        var self = this;

        // Register bundle with task so that user can call 'gulp task-name:bundle-name'
        Object.keys(self.tasks).forEach(function (task) {
            if (!bundle.hasOwnProperty(task)) {
                return;
            }
            self.tasks[task].registerBundle(bundle);
        });
    }

});
