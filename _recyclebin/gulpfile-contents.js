var concat      = require('gulp-concat'),
    header      = require('gulp-header'),
    mocha       = require('gulp-mocha'),
    uglify      = require('gulp-uglify');

gulp.task('tests', ['make-browser-test-suite'], function () {
    gulp.src('tests/for-server/**/*.js')
        .pipe(mocha());
});

gulp.task('concat', function () {
    return gulp.src([ ])
        .pipe(concat('./filename.js'))
        .pipe(header('/**! filename.js <%= (new Date()) %> **/'))
        .pipe(gulp.dest('./'));
});

gulp.task('uglify', ['concat'], function () {
    gulp.src([ ])
        .pipe(concat('./filename.min.js'))
        .pipe(uglify())
        .pipe(header('/**! filename.min.js <%= (new Date()) %> **/'))
        .pipe(gulp.dest('./'));
});

gulp.task('make-browser-test-suite', function () {
    return gulp.src(['tests/for-server/**/*.js'])
        .pipe(concat('tests/for-browser/test-suite.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
    gulp.watch(['./tests/for-server/*', './src/**/*'], [
        'concat',
        'uglify',
        'make-browser-test-suite'
    ]);
});

// Default task
gulp.task('default', [
    'concat',
    'uglify',
    'make-browser-test-suite',
    'watch'
]);
