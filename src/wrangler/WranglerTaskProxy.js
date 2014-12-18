/**
 * Created by edelacruz on 9/19/2014.
 */
"use strict"; require("sjljs");

var Optionable = require(path.join(__dirname, "../Optionable.js"));

module.exports = Optionable.extend(function WranglerTaskProxy(options) {
        Optionable.call(this, sjl.extend(true, {
            alias: "Task's cli name goes here.",
            description: "Task's description goes here.",
            help: "Task's help details go here."
        }, options));
    },
    {
        registerStaticTasks: function (gulp, wrangler) {
            // override from extending class
        }
    });
