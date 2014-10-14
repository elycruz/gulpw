/**
 * Created by edelacruz on 9/19/2014.
 */
require('sjljs');

modules.export = new sjl.Extendable.extend(function TaskProxy(options) {
        sjl.extend(this, {
            name: "Task's cli name goes here.",
            description: "Task's description goes here.",
            help: "Task's help details go here."
        }, options);
    },
    {
        registerBundle: function (bundle) {
            // Overrite on extend or creation
        }
    });
