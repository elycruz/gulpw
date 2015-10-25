/**
 * Created by elydelacruz on 10/3/15.
 */

'use strict';

require('sjljs');

var fs = require('fs'),
    csslint = require('gulp-csslint'),
    chalk = require('chalk'),
    duration = require('gulp-duration'),
    path = require('path'),
    callback = require('gulp-fncallback'),
    BaseBundleTaskAdapter = require('./BaseBundleTaskAdapter'),
    lazypipe = require('lazypipe');

module.exports = BaseBundleTaskAdapter.extend(function BasicGulpModuleAdapter(/*options*/) {
    this.pipeModule = null;
    this.alternateFilesKey = '' // namespace string to alternate files key
    BaseBundleTaskAdapter.apply(this, arguments);
}, {

    registerGulpTask: function (taskName, gulp, wrangler, bundle) {

    },

    registerBundle: function (bundle, gulp, wrangler) {
        var self = this,
            taskName = this.getTaskNameForBundle(bundle),
            filesToExclude = wrangler.tasks.jshint.ignoredFiles,
            src = self.getTargetsForBundle(bundle, wrangler);

        gulp.task(taskName, function () {
            console.log(chalk.cyan('Running "' + taskName + '"\n'));
            return gulp.src(src)
                .pipe(self.getPipe(bundle, gulp, wrangler)());
        });

    },

    registerBundles: function (bundles, gulp, wrangler) {
        var self = this,
            targets = [];
        bundles.forEach(function (bundle) {
            if (!self.isBundleValidForTask(bundle)) {
                return;
            }
            self.registerBundle(bundle, gulp, wrangler);
            targets.push('jshint:' + bundle.options.alias);
        });
        self.registerGulpTasks('jshint', targets, gulp, wrangler);
    },

    getFileTargetsForTask: function (bundle/*, wrangler*/) {
        var targets = [],
            bundleTaskConfig = bundle.getConfigForTask(this.alias),
            classOfTask = sjl.classOf(bundleTaskConfig);
        if (classOfTask === 'Array') {
            targets = targets.concat(bundleTaskConfig);
        }
        else if (bundle.has(this.alias + '.files')) {
            targets = targets.concat(bundle.options.files);
        }
        return targets;
    },

    getTaskConfigFromBundle: function (bundle) {
        var retVal = null;
        if (!Array.isArray(bundle.options[this.alias])) {

        }
        //this.wrangler.cloneOptionsFromWrangler(this.alias, )

    },

    getPipeOptions: function (key, wrangler) {

    },

    getPipe: function (bundle, gulp, wrangler) {
        if (!this.pipe) {
            this.pipe = lazypipe()
                .pipe (this.pipeModule, this.getPipeOptions(bundle, wrangler));
        }
        return this.pipe;
    },

    isBundleValidForTask: function (bundle) {
    }
});
