/**
 * Created by edelacruz on 9/19/2014.
 */
require('sjljs');

module.exports = new sjl.Extendable.extend(function WranglerTaskProxy(options) {
        sjl.extend(true, this, {
            name: "Task's cli name goes here.",
            description: "Task's description goes here.",
            help: "Task's help details go here."
        }, options);
    });
