/**
 * Created by edelacruz on 9/19/2014.
 */

'use strict';

require('sjljs');

var chalk = require('chalk');

module.exports = sjl.Extendable.extend(function TaskAdapter(options, gulp, wrangler) {
        sjl.extend(true, this, {
            alias: 'Task\'s cli name goes here.',
            description: 'Task\'s description goes here.',
            help: 'Task\'s help details go here.'
        }, options);
        this.wrangler = wrangler;
        this.gulp = gulp;
    },
    {
        registerBundle: function (bundle) {
            // Overwrite from extending class
        },

        registerBundles: function (bundles, gulp, wrangler) {
            // Overwrite from extending class
        },

        registerGulpTasks: function (taskName, tasks, gulp, wrangler, deps) {
            gulp.task(taskName, deps || [], function () {
                return wrangler.launchTasks(tasks, gulp);
            });
        },

        launchTasks: function (tasks, gulp, wrangler) {
            return wrangler.launchTasks(tasks, gulp);
        },

        isBundleValidForTask: function (bundle) {
            // Overwrite from extending class
        },

        isValidTaskSrc: function (src) {
            return (sjl.classOfIs(src, 'String') || sjl.classOfIs(src, 'Array')) && !sjl.empty(src);
        },

        getTasksForBundle: function (bundle, targets, ignoredTasks) {
            return targets.map(function (task) {
                return task + ':' + bundle.options.alias;
            });
        },

        getPrelimTasksForBundle: function (bundle, gulp, wrangler) {
            // Overwrite from extending class
        },

        getTaskNameForBundle: function (bundle) {
            return this.alias + ':' + bundle.options.alias;
        }

    });
