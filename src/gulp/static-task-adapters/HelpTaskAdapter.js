/**
 * Created by ely on 4/6/15.
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
let sjl = require('sjljs'),
    BaseStaticTaskAdapter = require('./../../StaticTaskAdapter'),
    fs = require('fs'),
    path = require('path'),
    chalk = require('chalk');

module.exports = class HelpTaskAdapter extends BaseStaticTaskAdapter {

    register(taskManager) {
        var self = this,
            //helpSectionPaths = self.getHelpSectionPaths(taskManager),
            helpSectionPathKeys = self.getHelpSectionPathKeys(taskManager),
            helpSection = taskManager.argv.section || null;

        taskManager.taskRunnerAdapter.task('help', function () {
            if (!sjl.isset(helpSection)) {
                taskManager.log(chalk.cyan('Help via this console is available for the ' +
                    'following sections:\n'), '--mandatory');
                taskManager.log(helpSectionPathKeys.map(function (key) {
                    return '- ' + key;
                }).join('\n'), '--mandatory');
                return Promise.reject();
            }
            else if (helpSectionPathKeys.indexOf(helpSection) > -1) {
                taskManager.log(fs.readFileSync(path.join(taskManager.pwd, 'docs', helpSection + '.md'), {encoding: 'utf8'}), '--mandatory');
            }
            return Promise.resolve();
        });

    }

    getHelpSectionPaths(taskManager) {
        if (!sjl.isset(this.helpSectionPaths)) {
            this.helpSectionPaths = fs.readdirSync(path.join(taskManager.pwd, 'docs'));
        }
        return this.helpSectionPaths;
    }

    getHelpSectionPathKeys(taskManager) {
        if (!sjl.isset(this.helpSectionPathKeys)) {
            this.helpSectionPathKeys = this.getHelpSectionPaths(taskManager).map(function (key) {
                return path.basename(key, '.md');
            });
        }
        return this.helpSectionPathKeys;
    }

};
