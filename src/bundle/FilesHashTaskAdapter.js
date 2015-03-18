/**
 * Created by edelacruz on 9/19/2014.
 */

// Global
'use strict';

require('sjljs');
require('es6-promise').polyfill();

var path = require('path'),

    jsStringEscape = require('js-string-escape'),

    TaskAdapter = require(path.join(__dirname, 'TaskAdapter.js')),

    lodash = require('lodash'),

    fs = require('fs');

module.exports = TaskAdapter.extend(function FilesTaskAdapter(options) {
        TaskAdapter.apply(this, arguments);
    },
    {
        // @todo use this method for minify tasks as well (methods will be almost identical
        registerBundles: function (bundles, gulp, wrangler) {

            var self = this,
                tasks = [],
                separator = ':',
                taskPrefix = self.alias,
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
                    tasks.push(taskPrefix + separator + bundle.options.alias);
                }

            }); // end of bundles loop

            // Set up global `concat` task
            gulp.task(taskPrefix, function () {
                return self.launchTasks(tasks, gulp, wrangler);
            });

        }, // end of `registerBundles`

        isBundleValidForTask: function (bundle) {
            // If bundle doesn't have any of the required keys, bail
            return bundle && bundle.has('files')
                && (bundle.has('files.js') || bundle.has('files.css') || bundle.has('files.html'));
        },

        getTemplatesString: function (bundle, gulp, wrangler) {
            var output = '',
                fileContent,
                templateOptions = wrangler.clone(wrangler.getTaskAdapter('minify').template),
                compressWhitespace = templateOptions.compressWhitespace,
                template = templateOptions.templatePartial;

            // Loop through allowed templates concatenation keys
            templateOptions.templateTypeKeys.forEach(function (key) {

                // If bundle doesn't have file type key, bail
                if (!bundle.has('files.' + key)) {
                    return;
                }

                // Loop through template files in bundle
                bundle.options.files[key].forEach(function (file) {

                    // Get file contents and make string safe for javascript
                    fileContent = jsStringEscape(fs.readFileSync(file));

                    // Remove white space if necessary
                    fileContent = compressWhitespace ? fileContent.replace(/[\s\t]{2,}/, ' ') : fileContent;

                    // Write file contents to key value pair on templates object
                    output += lodash.template(template, sjl.extend({fileBasename: path.basename(file, '.' + key),
                        fileContent: fileContent}, templateOptions));

                }); // end of template files loop

            }); // end of template type keys loop

            return output;
        }

    });
