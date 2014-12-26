/**
 * Created by Ely on 12/26/2014.
 */

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    srcs = ['./src/**/*.js', './tests/**/*.js'];

gulp.task('jshint', function () {
    gulp.src(srcs)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function () {
    gulp.watch(srcs, ['jshint']);
});

gulp.task('default', ['jshint', 'watch']);
