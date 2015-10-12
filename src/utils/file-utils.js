/**
 * Created by elycruz on 10/5/15.
 */

'use strict';

var path = require('path'),
    crypto = require('crypto');

module.exports = (function () {

    return {
        addFileHashToFilename: function (file, enc, hasher, frontOrBack) {
            hasher = hasher || crypto.createHash('md5');

            var basename = path.basename(file.path),
                extname = path.extname(basename),
                dirname = path.dirname(file.path),
                typeofHasherNotString = !sjl.classOfIs(hasher, 'String'),
                hash;

            basename = path.basename(basename, extname);

            if (typeofHasherNotString) {
                hasher.update(file.contents.toString(enc));
                hash = hasher.digest('hex');
            }
            if (!frontOrBack) {
                file.basename = basename + '-' + hash + extname;
            }
            else {
                file.basename = hash + '-' + basename + extname;
            }
            file.path = dirname + path.sep + file.basename;
            return file;
        }
    };
}());
