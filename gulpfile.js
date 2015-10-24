/**
 * Created by Ely on 12/26/2014.
 */

'use strict';

require('sjljs');

var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    srcs = ['./src/**/*.js', './tests/**/*.js'],
    concat = require('gulp-concat'),
    fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    bump = require('gulp-bump');

gulp.task('tasks-section', function () {
    var gulpwConfig = yaml.safeLoad(fs.readFileSync('configs/wrangler.config.yaml')),
        availableTaskKeys = Object.keys(gulpwConfig.tasks).concat(Object.keys(gulpwConfig.staticTasks)),
        fileData = '## Available Tasks\n',
        availableTasksNav = [],
        availableTasksContents = [];

    // Sort task keys in alphabetical order
    availableTaskKeys.sort(function (val1, val2) {
        var retVal = 0;
        if (val1 < val2) {
            retVal = -1;
        }
        else if (val1 > val2) {
            retVal = 1;
        }
        return retVal;
    });

    // Compile available tasks menu
    availableTaskKeys.forEach(function (key) {
        availableTasksNav.push('- [' + key + '](#' + key + ')');
    });

    // Get task sections
    availableTaskKeys .forEach(function (key) {
        availableTasksContents.push(fs.readFileSync('./docs/' + key + '.md'));
    });

    // Concat file contents
    fileData += (availableTasksNav.join('\n') + '\n\n' +
                    availableTasksContents.join('\n'))
                        .replace(/\n{2,}/, '\n\n');

    // Write file contents
    fs.writeFileSync('./docs/tasks-section.md', fileData);
});

gulp.task('readme', ['tasks-section'], function () {
    gulp.src([
        'docs/intro.md',
        'docs/basic-idea.md',
        'docs/quick-nav.md',
        'docs/install.md',
        'docs/setup.md',
        'docs/bundle-configuration.md',
        'docs/running-tasks.md',
        'docs/tasks-section.md',
        'docs/available-flags.md',
        'docs/caveats.md',
        'docs/resources.md',
        'docs/licenses.md'
    ])
        .pipe(concat('./README.md'))
        .pipe(gulp.dest('./'));
});

gulp.task('eslint', function () {
    gulp.src(srcs)
        .pipe(eslint({useEslintrc: true}))
        .pipe(eslint.format('stylish'))
        .pipe(eslint.failAfterError());
});

gulp.task('bump', function(){
    gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
    gulp.watch(srcs, ['eslint']);
    gulp.watch('./docs/*.md', ['readme']);
});

gulp.task('default', ['eslint', 'readme', 'watch']);
