/**
 * Created by edelacruz on 9/19/2014.
 */

// Global
require('sjljs');

var path = require('path'),

    TaskProxy = require(path.join(__dirname, "TaskProxy.js"));

module.exports = TaskProxy.extend(function FilesTaskProxy(options) {
        TaskProxy.apply(this, options);
    },
    {
        // @todo use this method for minify tasks as well (methods will be almost identical
        registerBundles: function (bundles, gulp, wrangler) {

            var self = this,
                tasks = [],
                separator = wrangler.getTaskStrSeparator(),
                taskPrefix = self.name,
                hasSection;

            bundles.forEach(function (bundle) {

                // If bundle doesn't have any of the required keys, bail
                if (!self.isBundleValidForTask(bundle)) {
                    return;
                }

                // Check for sections on bundle that can be concatenated
                hasSection = ['js', 'css', 'html'].filter(function (ext) {
                    var section = bundle.options.files[ext];

                    // If section is not empty or an array or a string then true
                    return !sjl.empty(section) && (Array.isArray(section) || sjl.classOfIs(section, 'String'));

                }).length > 0; // end of loop

                // Collect task name for use later
                if (hasSection) {
                    tasks.push(taskPrefix + separator + bundle.options.name);
                }

            }); // end of bundles loop

            // Set up global `concat` task
            gulp.task(taskPrefix, function () {
                self.launchTasks(tasks, gulp, wrangler);
            });

        }, // end of `registerBundles`

        isBundleValidForTask: function (bundle) {
            // If bundle doesn't have any of the required keys, bail
            return !(!bundle || !bundle.hasFiles()
            || (!bundle.hasFilesJs() && !bundleHasFilesCss && !bundle.hasFilesHtml()));
        }

    });
