/**
 * Created by u067265 on 2/16/17.
 */

const sjl = require('sjljs'),
    Config = sjl.stdlib.Config,
    fjl = require('fjl'),
    ensureTaskMangerProperty = require('./ensureTaskManagerProperty'),
    TaskAdapter = require('./TaskAdapter');

class TaskAdapterManager extends Config {

    constructor (config, taskManager) {
        super();

        let _knownAdapterNames;

        ensureTaskMangerProperty(this, taskManager);

        Object.defineProperties(this, {
            knownAdapterNames: {
                get: function () {
                    return _knownAdapterNames;
                },
                set: function (value) {
                    sjl.throwTypeErrorIfNotOfType(TaskAdapterManager.name, 'knownAdapterNames', value, Set, SjlSet);
                    _knownAdapterNames = value;
                },
                enumerable: true
            },
            adapters: {
                value: new Map()
            }
        });

        this.set(config);
    }

    has (name) {
        return this.adapters.has(name);
    }

    create (taskName, taskConfig) {
        taskConfig.alias = taskName;
        let FetchedTaskAdapterClass = require(path.join(this.cwd, taskConfig.constructorLocation)),
            taskAdapter = new FetchedTaskAdapterClass(taskConfig, this);
        return taskAdapter;
    }

    /**
     * @param name {String|Object|TaskAdapter}
     * @param [config]
     */
    get (name, config) {
        return this.adapters.get(name);
    }

    set (taskAdapter) {
        this.adapters.set(taskAdapter.alias, taskAdapter);
    }

    remove (taskAdapter) {
        this.adapters.remove(taskAdapter.alias);
    }

}

TaskAdapterManager.prototoype.delete = function (taskAdapter) {

};

module.exports = TaskAdapterManager;
