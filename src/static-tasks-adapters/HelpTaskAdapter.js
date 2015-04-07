/**
 * Created by ely on 4/6/15.
 */

'use strict';

require('sjljs');

// Import base task proxy to extend
var BaseStaticTaskAdapter = require('./BaseStaticTaskAdapter'),
    fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    inquirer = require('inquirer'),
    chalk = require('chalk');

module.exports = BaseStaticTaskAdapter.extend(function HelpTaskAdapter () {
    BaseStaticTaskAdapter.call(this, arguments);
}, {

    registerStaticTask: function (gulp, wrangler) {
        var self = this,
            helpSectionPaths = self.getHelpSectionPaths(wrangler),
            helpSectionPathKeys = self.getHelpSectionPathKeys(wrangler),
            helpSection = process.argv.length === 4 ? process.argv[3] : null;

        gulp.task('help', function () {
            if (!sjl.isset(helpSection)) {
                wrangler.log(chalk.cyan('Help via this console is available for the ' +
                                'following sections:\n'), '--mandatory');
                wrangler.log(helpSectionPathKeys.map(function (key) { return '- ' + key; }).join('\n'), '--mandatory');
                return process.exit(0);
            }
        });

    }, // end of register task

    getHelpSectionPaths: function (wrangler) {
        if (!sjl.isset(this.helpSectionPaths)) {
            this.helpSectionPaths = fs.readdirSync(path.join(wrangler.pwd, 'docs'));
        }
        return this.helpSectionPaths;
    },

    getHelpSectionPathKeys: function (wrangler) {
        if (!sjl.isset(this.helpSectionPathKeys)) {
            this.helpSectionPathKeys = this.getHelpSectionPaths().map(function (key) {
                return path.basename(key, '.md');
            });
        }
        return this.helpSectionPathKeys;
    }

});
