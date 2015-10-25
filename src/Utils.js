/**
 * Created by edelacruz on 6/9/2015.
 * @todo replace all usages of Wrangler.prototype.clone with sjl.jsonClone
 */

'use strict';

require('sjljs');

var fs = require('fs'),
    os = require('os'),
    glob = require('glob'),
    mkdirp = require('mkdirp'),
    yaml = require('js-yaml');

module.exports = {

    /**
     * Returns the files located at glob string or the string passed in if it doesn't contain glob magic.
     * @param string {String} - Glob string to parse.
     * @returns {Array|String} - See description above.
     */
    explodeGlob: function (string) {
        var out = string;
        if (glob.hasMagic(string)) {
            out = glob.sync(string);
        }
        return out;
    },

    /**
     * Explodes any globs in an array of file paths and replaces the glob entries with actual file paths.
     * @param fileList {Array} - Array of file paths.
     * @returns {Array} - Array of file paths with globs replaced by actual file entries.
     */
    explodeGlobs: function (fileList) {
        var self = this,
            out = [];
        fileList.forEach(function (file) {
            var value = self.explodeGlob(file);
            if (Array.isArray(value)) {
                out = out.concat(value);
            }
            else {
                out.push(value);
            }
        });
        return out;
    },

    ensurePathExists: function (dirPath) {
        return mkdirp.sync(dirPath);
    },

    splitCommand: function (command) {
        var out = {command: command, taskAlias: command, params: null},
            args;
        if (command.indexOf(':')) {
            args = command.split(':');
            out = {command: command, taskAlias: args.shift(), params: args};
        }
        return out;
    },

    pathToForwardSlashes: function (filePath, checkForWindows) {
        if (!sjl.empty(checkForWindows)) {
            filePath = os.type().toLowerCase().indexOf('windows') > -1 ? filePath.replace(/\\/g, '/') : filePath;
        }
        else {
            filePath = filePath.replace(/\\/g, '/');
        }
        return filePath;
    },

    getTaskAliasesFromArray: function (list) {
        var out  = [];
        list = list || this.argv._;
        list.forEach(function (arg) {
            out.push(arg.indexOf(':') ? arg.split(':')[0] : arg);
        });
        return out;
    },

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
        else if (file.lastIndexOf('.yaml') === file.length - 5
            || file.lastIndexOf('.yml') === file.length - 4) {
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
        if (filePath.lastIndexOf('.json') === filePath.length - 5) {
            obj = JSON.stringify(obj, '    ');
        }
        else if (filePath.lastIndexOf('.yaml') === filePath.length - 5
            || filePath.lastIndexOf('.yml') === filePath.length - 4) {
            obj = yaml.safeDump(obj);
        }
        else if (filePath.lastIndexOf('.js') === filePath.length - 3) {
            obj = '\'use strict\'; module.exports = ' + JSON.stringify(obj, '    ') + ';';
        }
        fs.writeFileSync(filePath, obj);
        return this;
    },

    /**
     * Returns a `Map` object from a plain javascript object (`Objet`).
     * @param obj {Object} - Object to parse.  Required.
     * @param transformKeyCallback {Function} - Function that takes the key of `obj` and allows you to transform it.  Optional.
     * @returns {Map} - The new created map.
     */
    objectHashToMap: function (obj, transformKeyCallback) {
        transformKeyCallback = transformKeyCallback || function (key) {return key + '';};
        var out = new Map();
        Object.keys(obj).forEach(function (key) {
            out.set(transformKeyCallback(key), obj[key]);
        });
        return out;
    }

};
