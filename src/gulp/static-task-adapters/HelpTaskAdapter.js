/**
 * Created by ely on 4/6/15.
 */

'use strict';

require('sjljs');

// Import  task proxy to extend
let sjl = require('sjljs'),
    StaticTaskAdapter = require('./../../StaticTaskAdapter'),
    fs = require('fs'),
    path = require('path'),
    chalk = require('chalk'),
    renderListToColumns = require('../../console/renderListToColumns');

class HelpTaskAdapter extends StaticTaskAdapter {

    register(taskManager) {
        let self = this,
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
                taskManager.log('\n', fs.readFileSync(filePath, {encoding: 'utf8'}), '\n');
            }
            else {
                taskManager.log('No help found for help section: ' + chalk.cyan('"' + helpSection + '"') + '.\n');
                taskManager.log(chalk.cyan('Available help sections:\n'));
                taskManager.log(renderListToColumns(helpSectionPathKeys));
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

}

module.exports = HelpTaskAdapter;
