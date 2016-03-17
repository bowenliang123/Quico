'use strict';

// Load plugins
var gulp = require('gulp'),
    clean = require('gulp-clean'),
    zip = require('gulp-zip');


// 复制必要的文件
gulp.task('copyBower', ['clean'], function () {
    return gulp.src([
            //angular
            'bower_components/angular/angular.min.js',

            //boostrap
            'bower_components/bootstrap/dist/**/*',

            //font-awesome
            'bower_components/font-awesome/css/**/*',
            'bower_components/font-awesome/fonts/**/*',

            //jquery
            'bower_components/jquery/dist/**/*',

            //qrcode.js
            'bower_components/qrcode.js/qrcode.js',
        ], {"base": "."})
        .pipe(gulp.dest('dist/'));
});

// 复制必要的文件
gulp.task('copy', ['copyBower', 'clean'], function () {
    return gulp.src([
            'manifest.json',
            'html/*',
            'js/**/*',
            'css/*',
            //'bower_components/**/',
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
gulp.task('zip', ['clean', 'copy'], function () {
    return gulp.src('dist/**/*', {"base": "."})
        .pipe(zip('quico-' + new Date() + '.zip'))
        .pipe(gulp.dest('releases'));
});


// Build
gulp.task('build', ['clean', 'copy', 'zip'], function () {
});

// Default
gulp.task('default', ['build'], function () {
    gulp.run('zip');
});

// Watch
gulp.task('watch', function () {
    gulp.watch([
        'js/**/*',
        'css/**/*',
        'html/**/*',
        'img/**/*',
        'bower_components/**/*',
    ], function (event) {
        gulp.run('build');
    })
});