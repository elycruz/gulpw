/**
 * Created by elydelacruz on 10/4/15.
 */

'use strict';

class TaskManager {

    constructor (taskRunner, argv, env, config) {
        sjl.extend(true, this, {
            bundleConfigsPath: null,
            bundleConfigFormats: null,
            localConfigPath: null,
            localConfigBackupPath: null,
            localHelpDocsPath: null,
            helpDocsPath: null,
            taskConfigs: null,
            taskAdapters: null,
            taskNames: null,
            staticTaskConfigs: null,
            staticTaskNames: null,
            taskRunner: null,
            env: env,
            argv: argv,
            cwd: env.configBase,
            pwd: env.pwd,
            configPath: env.configPath
        }, defaultConfig);

        this.taskNames = Object.keys()
    }

    getTaskAdapter (taskName) { }

    registerBundleConfigs (bundleConfigs) { }

    registerBundleConfigWithTask (bundleConfig, taskName) { }

    registerBundleConfigWithTasks (bundleConfig, taskNames) { }

    registerBundleConfigsWithTasks (bundleConfigs, taskNames) { }

    isTaskRegisteredWithTaskRunner (taskName) { }

    _createTaskAdapter (taskName) { }

    _createTaskAdapters (taskNames) { }

    _createStaticTaskAdapter (staticTaskName) { }

    _createStaticTaskAdapters (staticTaskNames) { }

    _createBundleConfig (bundleConfigObj) { }

    _createBundleConfigs (bundleConfigObjs, registerWithTaskAdapters) { }

    _setTaskAdapter (taskName, taskAdapter) { }

}
