/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
require('sjljs');

var TaskProxy = require('../TaskProxy'),
    separator = ':';

module.exports = TaskProxy.extend("ConcatProxy", {
    registerBundle: function (bundle) {
        gulp.task('concat' + separator + bundle.name, function () {
//            gulp.src()
//                .pipe(concat('./file.js'))
//                .pipe(header('/**! file.js <%= (new Date()) %> **/'))
//                .pipe(gulp.dest('./destination'));
        });
    }
});
