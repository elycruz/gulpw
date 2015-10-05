/**
 * Created by elycruz on 10/5/15.
 */
var crypto = require('crypto');
module.exports = {
    addFileHashToFilename: function (file, hasher, frontOrBack) {
        hasher = hasher || crypto.createHash('md5'),
        hasher.update(file.contents.toString(enc));
        var basename = path.basename(file.path),
            extname = path.extname(basename),
            dirname = path.dirname(file.path);
        basename = path.basename(basename, extname);
        if (!frontOrBack) {
            file.basename = basename + '-' + hasher.digest('hex') + extname;
        }
        else {
            file.basename = hasher.digest('hex') + '-' + basename + extname;
        }
        file.path = dirname + path.sep + file.basename;
        return file;
    }
};