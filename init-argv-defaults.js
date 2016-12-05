/**
 * Created by u067265 on 12/5/16.
 */

'use strict';

module.exports = function (argv) {
    return argv

        // Default param values
        .default('verbose',         false)
        .default('debug',           false)
        .default('skip-artifacts',  false)
        .default('bundle',          null)
        .default('async',           false)
        .default('force',           false)
        .default('out',             null)

        // @todo move these to ./configs/gulpw-config.yaml
        // Command line param alias
        .alias('o',                 'out')
        .alias('a',                 'async')
        .alias('d',                 'dev')
        .alias('f',                 'force')
        .alias('g',                 'topLevelConfig')
        .alias('v',                 'verbose')
        .alias('skip-css-hint',     'skip-css-linting')
        .alias('skip-css-lint',     'skip-css-linting')
        .alias('skip-css-hinting',  'skip-css-linting')
        .alias('skip-js-hint',      'skip-js-linting')
        .alias('skip-js-lint',      'skip-js-linting')
        .alias('skip-js-hinting',   'skip-js-linting')
        .alias('skip-hinting',      'skip-linting')
        .alias('skip-hint',         'skip-linting')
        .alias('skip-lint',         'skip-linting')
        .alias('skip-jasmine',      'skip-jasmine-tests')
        .alias('skip-mocha',        'skip-mocha-tests')
        .alias('skip-testing',      'skip-tests')
        .alias('skip-hashing',      'skip-hashes')
        .alias('skip-related',      'skip-related-bundles')
        .alias('show-files',        'show-file-sizes')
        .alias('filetypes',         'file-types')
        .alias('filetype',          'file-types')
        .alias('ext',               'file-types')
        .argv;
};
