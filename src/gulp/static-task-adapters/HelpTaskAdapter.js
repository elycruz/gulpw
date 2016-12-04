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
    chalk = require('chalk'),
    renderListToColumns = require('../../console/renderListToColumns');

module.exports = class HelpTaskAdapter extends BaseStaticTaskAdapter {

    register(taskManager) {
        let self = this,
            //helpSectionPaths = self.getHelpSectionPaths(taskManager),
            helpSectionPathKeys = self.getHelpSectionPathKeys(taskManager),
            helpSection = taskManager.argv.section || null;

        return taskManager.taskRunnerAdapter.task('help', function () {
            if (!sjl.isset(helpSection)) {
                taskManager.log(chalk.cyan(
                    'Help via this console is available for the ' +
                    'following sections:\n'));
                taskManager.log(renderListToColumns(helpSectionPathKeys));
                return Promise.reject();
            }
            else if (helpSectionPathKeys.indexOf(helpSection) > -1) {
                let filePath = path.join(taskManager.pwd, self.config.helpPath, helpSection + '.md');
                console.log('hereio', filePath);
                taskManager.log('\n', fs.readFileSync(filePath, {encoding: 'utf8'}), '\n');
            }
            return Promise.resolve();
        });
    }

    getHelpSectionPaths(taskManager) {
        return fs.readdirSync(path.join(taskManager.pwd, this.config.helpPath));
    }

    getHelpSectionPathKeys(taskManager) {
        return this.getHelpSectionPaths(taskManager).map( key => path.basename(key, '.md'));
    }

};
