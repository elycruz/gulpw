/**
 * Created by elydelacruz on 10/4/15.
 */
/**
 * Created by edelacruz on 6/9/2015.
 * @todo replace all usages of Wrangler.prototype.clone with sjl.jsonClone
 */

'use strict';

var _arguments = arguments;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var sjl = require('sjljs'),
    fs = require('fs'),
    os = require('os'),
    glob = require('glob'),
    mkdirp = require('mkdirp'),
    yaml = require('js-yaml');

module.exports = {

    /**
     * @type {Array}
     */
    supportedExts: ['.js', '.json', '.yaml', '.yml'],

    /**
     * Returns the files located at glob string or the string passed in if it doesn't contain glob magic.
     * @param string {String} - Glob string to parse.
     * @returns {Array|String} - See description above.
     */
    explodeGlob: function explodeGlob(string) {
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
    explodeGlobs: function explodeGlobs(fileList) {
        var self = this,
            out = [];
        fileList.forEach(function (file) {
            var value = self.explodeGlob(file);
            if (Array.isArray(value)) {
                out = out.concat(value);
            } else {
                out.push(value);
            }
        });
        return out;
    },

    /**
     * Forces creation of a path (deeply) if it doesn't exist.
     * @param dirPath {String} - Path to ensure existence on.
     * @returns {*}
     */
    ensurePathExists: function ensurePathExists(dirPath) {
        return mkdirp.sync(dirPath);
    },

    /**
     * Replaces backslashes in path to forward slashes.
     * @param filePath {String}
     * @param checkForWindows {Boolean} - Whether to check for windows first before enforcing foward slashes.  Default `false`.
     * @returns {*}
     */
    pathToForwardSlashes: function pathToForwardSlashes(filePath, checkForWindows) {
        if (!sjl.empty(checkForWindows)) {
            filePath = os.type().toLowerCase().indexOf('windows') > -1 ? filePath.replace(/\\/g, '/') : filePath;
        } else {
            filePath = filePath.replace(/\\/g, '/');
        }
        return filePath;
    },

    /**
     * Gets the task aliases specified in an array of gulp task names.
     * @param list {Array}
     * @returns {Array}
     */
    getTaskAliasesFromArray: function getTaskAliasesFromArray(list) {
        var out = [];
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
    loadConfigFile: function loadConfigFile(file) {
        if (file.lastIndexOf('.js') === file.length - 3 || file.lastIndexOf('.json') === file.length - 5) {
            file = require(file);
        } else if (file.lastIndexOf('.yaml') === file.length - 5 || file.lastIndexOf('.yml') === file.length - 4) {
            file = yaml.safeLoad(fs.readFileSync(file));
        } else {
            throw new TypeError('`Utils` Only *.js, *.json, or *.yaml and *.yml config files supported.');
        }
        return file;
    },

    /**
     * Writes a configuration file depending on file extension in the `filePath` parameter.
     * @param obj {Object} - Object to convert to file.
     * @param filePath {String} - File path to write `obj` to.
     * @returns {exports}
     */
    writeConfigFile: function writeConfigFile(obj, filePath) {
        if (filePath.lastIndexOf('.json') === filePath.length - 5) {
            obj = JSON.stringify(obj, '    ');
        } else if (filePath.lastIndexOf('.yaml') === filePath.length - 5 || filePath.lastIndexOf('.yml') === filePath.length - 4) {
            obj = yaml.safeDump(obj);
        } else if (filePath.lastIndexOf('.js') === filePath.length - 3) {
            obj = '\'use strict\'; module.exports = ' + JSON.stringify(obj, '    ') + ';';
        }
        fs.writeFileSync(filePath, obj);
        return this;
    },

    /**
     * @param filePath {String}
     * @param exts {Array|undefined}
     * @returns {*|null} - Null if no file found else file contents.
     */
    loadConfigFileFromSupportedExts: function loadConfigFileFromSupportedExts(filePath, exts) {
        exts = exts || undefined.supportedExts;
        var file = null;
        exts.some(function (ext) {
            try {
                file = undefined.loadConfigFile(filePath + ext);
            } catch (e) {
                // silent
            }
            return file !== null;
        });
        return file;
    },

    /**
     * @param fileName {String}
     * @param exts {Array|undefined}
     * @returns {*}
     */
    bundleNameFromFileName: function bundleNameFromFileName(fileName, exts) {
        exts = exts || undefined.supportedExts;
        var bundleName = null;
        exts.some(function (ext) {
            var lastIndexOfExt = fileName.lastIndexOf(ext),
                expectedLastIndexOfPos = fileName.length - ext.length - 2;
            if (lastIndexOfExt !== expectedLastIndexOfPos) {
                return false;
            }
            bundleName = fileName.split(new RegExp('\\' + ext + '$'))[0];
        });
        return bundleName;
    },

    logger: function logger(argv, context) {
        var self = context || undefined;
        return function () {
            var args = sjl.argsToArray(_arguments),
                possibleFlag = args[args.length - 1],
                lastArg;
            if (possibleFlag.indexOf('--') === 0) {
                lastArg = args.pop();
                if (argv.debug && lastArg === '--debug') {
                    console.log.apply(console, _toConsumableArray(args));
                } else if (argv.verbose && lastArg === '--verbose') {
                    console.log.apply(console, _toConsumableArray(args));
                }
            } else {
                console.log.apply(console, _toConsumableArray(args));
            }
            return self;
        };
    }
};