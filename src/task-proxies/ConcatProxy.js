/**
 * Created by ElyDeLaCruz on 10/5/2014.
 */
gulp.task('concat', function () {
    gulp.src()
        .pipe(concat('./file.js'))
        .pipe(header('/**! file.js <%= (new Date()) %> **/'))
        .pipe(gulp.dest('./destination'));
});