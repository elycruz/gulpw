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

    sjl.extend(this, defaultOptions, config);
}, {

    init: function (gulp) {
        var self = this,
            bundle = self.addBundleFromConfig(config);
        self.createTasksForBundle(gulp, bundle);
        return gulp;
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

        // Get bundles location
        // Loop through bundle location and create tasks for each bundle
        // (will allow `gulp task-name:bundle-name` from cli)
        // (didn't want to do it this way but since gulp doesn't let you hook
            // into it's task calling mechanism, there really isn't another
            // way to do this)
    },

    runTaskOnBundle: function (task, bundle) {

    }

});
