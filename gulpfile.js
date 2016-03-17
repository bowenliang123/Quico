'use strict';

// Load plugins
var gulp = require('gulp'),
    clean = require('gulp-clean'),
    zip = require('gulp-zip');


// 复制必要的文件
gulp.task('move', ['clean'], function () {
    return gulp.src([
            'manifest.json',
            'html/*',
            'js/**/*',
            'css/*',
            'bower_components/**/',
            'img/*'
        ], {"base": "."})
        .pipe(gulp.dest('dist_quico/'));
});


// Clean
gulp.task('clean', function () {
    return gulp.src([
            'dist_quico/',
            'releases/'
        ], {read: false})
        .pipe(clean());
});

// zip
gulp.task('zip', function () {
    return gulp.src('dist_quico/**/*', {"base": "."})
        .pipe(zip('quico-' + new Date() + '.zip'))
        .pipe(gulp.dest('releases'));
});


// Build
gulp.task('build', ['move'], function () {
    gulp.run('zip');
});

// Watch
gulp.task('watch', function () {
    gulp.watch('gulpfile.js', function (event) {
        gulp.run('build');
    })
});