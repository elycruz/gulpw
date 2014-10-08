/**
 * Created by Ely on 10/4/2014.
 */
require('sjljs');

var Bundle = require('Bundle');

modules.export = sjl.Extendable.extend(function GulpBundleWrangler (config) {
    var defaultConfig = {
        tasks: {},
        dirs: {},
        bundles: {}
    };

    sjl.extend(true, this, defaultConfig, config);

}, {

    init: function (gulp) {
        this.createTaskProxyObjects(gulp)
            .createBundleObjects(gulp);
        return gulp;
    },

    createTaskProxyObjects: function (gulp) {
        var self = this;
        Object.keys(self.tasks).forEach(function (task) {

//            var TaskClass = require('task-proxies/' + sjl.camelCase(task + '-proxy'));
//            self.tasks[task] = new TaskClass(gulp);
        });
    },

    createBundleObjects: function (gulp) {
        var self = this;

//        fs.readdirSync();

        var bundle = self.addBundleFromConfig(config);

        self.createTasksForBundle(gulp, bundle);
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
