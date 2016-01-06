/**
 * Created by Ely on 1/5/2016.
 */

let sjl = require('sjljs'),
    TaskAdapter = require('./TaskAdapter'),
    contextName = 'TaskAdapterManager';

class TaskAdapterManager {

    constructor (taskAdapterConfigs) {
        this.taskAdapters = null;
        Object.defineProperties(this, {
            taskAdapters: {
                value: new sjl.SjlMap()
            }
        });
    }

    getTaskAdapter (name) {
        return this.taskAdapters.get(name);
    }

    setTaskAdapter (taskAdapter) {
        if (taskAdapter instanceof TaskAdapter === false) {
            throw new Error ();
        }
        this.taskAdapters.set(taskAdapter.alias, taskAdapter);
    }

    getTaskAdapters (aliases) {
        var retVal = this.taskAdapters.values();
        if (Array.isArray(aliases) && aliases.length > 0) {
            retVal = sjl.iterable(aliases.map((name) => {
                return this.taskAdapters.get(name);
            }, this));
        }
        return retVal;
    }

    setTaskAdapters (taskAdapters) {
        taskAdapters.forEach((taskAdapter) => {
            this.setTaskAdapter(taskAdapter.alias, taskAdapter);
        }, this);
        return this;
    }

    addFromTaskAdapterConfigs (taskAdapterConfigs) {
        var it;
        if (!(taskAdapterConfig instanceof Map) && !(taskAdapterConfgs instanceof sjl.ObjectIterator)) {
            it = sjl.iterable(taskAdapterConfigs);
        }
        it.forEach((key, value) => {
            this.setTaskAdapter(key, value);
        }, this);
        return this;
    }

}
