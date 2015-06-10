/**
 * Created by edelacruz on 9/19/2014.
 */

// Global
'use strict';

require('sjljs');

var path = require('path'),
    jsStringEscape = require('js-string-escape'),
    BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter.js'),
    lodash = require('lodash'),
    chalk = require('chalk'),
    fs = require('fs');

module.exports = BaseBundleTaskAdapter.extend(function FilesHashTaskAdapter(/*options, gulp, wrangler*/) {
        BaseBundleTaskAdapter.apply(this, sjl.argsToArray(arguments));
    },
    {
        registerBundles: function (bundles, gulp, wrangler) {

            var self = this,
                tasks = [],
                separator = ':',
                taskPrefix = self.alias,
                hasSection;

            // Bail if task is not configured by user
            if (wrangler.tasks.minify.notConfiguredByUser) {
                return;
            }

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
                    self.registerBundle(bundle, gulp, wrangler);
                    tasks.push(taskPrefix + separator + bundle.options.alias);
                }

            }); // end of bundles loop

            // Set up global `concat` task
            self.registerGulpTasks(taskPrefix, tasks, gulp, wrangler);

        }, // end of `registerBundles`

        isBundleValidForTask: function (bundle) {
            // If bundle doesn't have any of the required keys, bail
            return sjl.isEmptyObjKey(this.wrangler.tasks.minify, 'notConfiguredByUser')
                && sjl.classOfIs(bundle, 'Object') && bundle.has('files')
                && (bundle.has('files.js') || bundle.has('files.css') || bundle.has('files.html'));
        },

        getTemplatesString: function (bundle, gulp, wrangler) {
            var output = '',
                fileContent,
                templateOptions = sjl.jsonClone(wrangler.getTaskAdapter('minify').template),
                compressWhitespace = templateOptions.compressWhitespace,
                template = templateOptions.templatePartial,
                templateKey,
                self = this;

            // Loop through allowed templates concatenation keys
            templateOptions.templateTypeKeys.forEach(function (key) {

                // If bundle doesn't have file type key, bail
                if (!bundle.has('files.' + key)) {
                    return;
                }

                // Loop through template files in bundle
                wrangler.explodeGlobs(bundle.options.files[key]).forEach(function (file) {

                    // Ensure file exists before attempting to load it
                    if (!fs.existsSync(file)) {
                        console.log(chalk.yellow(' ! Template file doesn\'s exist: "' + file + '"\n'));
                        return;
                    }

                    // Get file contents and make string safe for javascript
                    fileContent = jsStringEscape(fs.readFileSync(file));

                    // Remove white space if necessary
                    fileContent = compressWhitespace ? fileContent.replace(/(?:[\s\t]{1,}|\\r|\\n)+/gm, ' ') //.replace(/>\s</gm, '><')
                        : fileContent;

                    // Get the template key
                    templateKey = self.getTemplateKey(file, key, templateOptions);

                    // Write file contents to key value pair on templates object
                    output += lodash.template(template)(sjl.extend({templateKey: templateKey,
                        templateContent: fileContent}, templateOptions));

                }); // end of template files loop

            }); // end of template type keys loop

            return output;
        },

        getTemplateKey: function (filePath, ext, templateOptions) {

            var fileBasename = path.basename(filePath, '.' + ext),
                fileDirname = path.dirname(filePath),
                templateKey = filePath,
                useFilePathAsKey = templateOptions.useFilePathAsKey,
                noExtension = templateOptions.removeFileExtensionsOnKeys,
                splitKeyAt = templateOptions.splitKeyAt;

            // Resolve whether to use file base name as key
            if (!useFilePathAsKey) {
                templateKey = noExtension ? fileBasename : path.basename(filePath);
            }
            // Else use file path as key
            else {
                templateKey = noExtension ? path.join(fileDirname, fileBasename) : templateKey;
            }

            templateKey = this.wrangler.pathToForwardSlashes(templateKey, true);
            // Compensate for `path.dirname` which removes './' when returning the 'dirname'
            splitKeyAt = splitKeyAt.indexOf('./') === 0 ? splitKeyAt.substr(2, splitKeyAt.length) : splitKeyAt;


            // Set template key to substring from `splitKeyAt` length to it's length
            if (splitKeyAt && templateKey.indexOf(splitKeyAt) === 0) {
                templateKey = templateKey.substr(splitKeyAt.length, templateKey.length);
            }

            // Return key
            return templateKey;
        }

    });
