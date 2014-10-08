/**
 * Created by Ely on 10/4/2014.
 */
require('sjljs');

modules.export = (function () {
    return new sjl.Extendable.extend('GulpBundleWrangler', {

        init: function () {
            this.createTasks();
        },

        createTasks: function () {
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
});
