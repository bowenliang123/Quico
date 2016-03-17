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
        .pipe(gulp.dest('dist/'));
});


// Clean
gulp.task('clean', function () {
    return gulp.src([
            'dist/',
            'releases/'
        ], {read: false})
        .pipe(clean());
});

// zip
gulp.task('zip', ['move'], function () {
    return gulp.src('dist/**/*', {"base": "."})
        .pipe(zip('quico-' + new Date() + '.zip'))
        .pipe(gulp.dest('releases'));
});


// Build
gulp.task('build', ['zip'], function () {
});

// Default
gulp.task('default', ['build'], function () {
    gulp.run('zip');
});

// Watch
gulp.task('watch', function () {
    gulp.watch('gulpfile.js', function (event) {
        gulp.run('build');
    })
});