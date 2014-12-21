/**
 * Created by edelacruz on 9/19/2014.
 */
"use strict"; require("sjljs");

module.exports = sjl.Optionable.extend(function WranglerTaskProxy(options) {
        sjl.Optionable.call(this, {
                alias: "Task's cli name goes here.",
                description: "Task's description goes here.",
                help: "Task's help details go here."
            }, options);
    },
    {
        registerStaticTasks: function (gulp, wrangler) {
            // override from extending class
        }
    });
