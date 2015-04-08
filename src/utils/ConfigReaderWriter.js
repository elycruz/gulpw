var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml');

module.exports = (function () {
    'use strict';
    return {

        /**
         * Loads a wrangler configuration file (which is simply a *.json, *.js, or *.yaml file).
         * @param file {String} - File path.
         * @returns {Object|*} - Returns the loaded returned value of loading `file` or file path
         *  if it does not match one of the allowed file types [json,js,yaml].
         */
        loadConfigFile: function (file) {
            if (file.lastIndexOf('.js') === file.length - 3
                || file.lastIndexOf('.json') === file.length - 5) {
                file = require(file);
            }
            else if (file.lastIndexOf('.yaml') === file.length - 5) {
                file = yaml.safeLoad(fs.readFileSync(file));
            }
            return file;
        },

        /**
         * Writes a configuration file depending on file extension in the `filePath` parameter.
         * @param obj {Object} - Object to convert to file.
         * @param filePath {String} - File path to write `obj` to.
         * @returns {exports}
         */
        writeConfigFile: function (obj, filePath) {
            if (filePath.lastIndexOf('.json') === file.length - 5) {
                obj = JSON.stringify(obj, '    ');
            }
            else if (filePath.lastIndexOf('.yaml') === file.length - 5) {
                obj = yaml.safeDump(obj);
            }
            else if (filePath.lastIndexOf('.js') === file.length - 3) {
                obj = '\'use strict\'; module.exports = ' + JSON.stringify(obj, '    ') + ';';
            }
            fs.writeFileSync(filePath, obj);
            return this;
        }

    };
}());